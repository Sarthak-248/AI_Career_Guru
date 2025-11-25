import { Prisma } from "@prisma/client";

import { db } from "@/lib/prisma";
import { fetchAdzunaJobs, NormalizedAdzunaJob } from "../adzuna";
import { isMatch, scoreMatch } from "../matching";
import { sendDigestEmail, sendImmediateEmail } from "../mailer";
import {
  sanitizeSkills,
  shouldSendDigest,
} from "./utils";

const PAGE_LIMIT = Number(process.env.ADZUNA_PAGE_LIMIT ?? 2);
const RESULTS_PER_PAGE = Number(process.env.ADZUNA_RESULTS_PER_PAGE ?? 20);
const PAGE_DELAY_MS = Number(process.env.ADZUNA_PAGE_DELAY_MS ?? 600);
const MATCH_THRESHOLD = Number(process.env.JOB_ALERT_THRESHOLD ?? 6);
const HAS_ADZUNA_CREDS =
  Boolean(process.env.ADZUNA_APP_ID) && Boolean(process.env.ADZUNA_APP_KEY);

type RunnerOptions = {
  subscriptionIds?: string[];
  trigger?: "manual" | "scheduled" | "demo";
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const upsertJobListing = async (job: NormalizedAdzunaJob) => {
  return db.jobListing.upsert({
    where: { url: job.url },
    create: {
      url: job.url,
      title: job.title,
      company: job.company,
      location: job.location,
      country: job.country,
      source: "adzuna",
      sourceId: job.sourceId,
      postedAt: job.created ? new Date(job.created) : new Date(),
      isRemote: job.isRemote,
      raw: job.raw as Prisma.JsonValue,
    },
    update: {
      title: job.title,
      company: job.company,
      location: job.location,
      country: job.country,
      postedAt: job.created ? new Date(job.created) : undefined,
      isRemote: job.isRemote,
      raw: job.raw as Prisma.JsonValue,
    },
  });
};

const createSentAlert = async (params: {
  subscriptionId: string;
  userId: string;
  jobListingId: string;
  score: number;
}) => {
  try {
    return await db.sentJobAlert.create({
      data: {
        subscriptionId: params.subscriptionId,
        userId: params.userId,
        jobListingId: params.jobListingId,
        score: params.score,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return null;
    }
    throw error;
  }
};

const toNormalizedJob = (job: NormalizedAdzunaJob) => job;

export const runJobAlertPipeline = async (options: RunnerOptions = {}) => {
  if (!HAS_ADZUNA_CREDS) {
    console.warn(
      "[job-alerts] Missing ADZUNA_APP_ID or ADZUNA_APP_KEY. Skipping run."
    );
    return {
      processed: 0,
      trigger: options.trigger ?? "manual",
      digests: 0,
      skippedReason: "missing-adzuna-credentials",
    };
  }

  const subscriptions = await db.jobAlertSubscription.findMany({
    where: {
      isActive: true,
      ...(options.subscriptionIds
        ? { id: { in: options.subscriptionIds } }
        : {}),
    },
    include: {
      user: true,
    },
  });

  const digestQueue: Array<{
    subscriptionId: string;
    userId: string;
    jobs: NormalizedAdzunaJob[];
    alertIds: string[];
  }> = [];

  for (const subscription of subscriptions) {
    const sanitizedSkills = sanitizeSkills(subscription.skills);
    const matchContext = {
      titleQuery: subscription.titleQuery,
      skills: sanitizedSkills,
      location: subscription.location,
      remotePreference: subscription.remotePreference,
      experienceLevel: subscription.experienceLevel,
    };
    const matches: NormalizedAdzunaJob[] = [];
    const createdAlertIds: string[] = [];

    for (let page = 1; page <= PAGE_LIMIT; page += 1) {
      if (page > 1) {
        await sleep(PAGE_DELAY_MS);
      }

      let jobs: NormalizedAdzunaJob[] = [];
      try {
        jobs = await fetchAdzunaJobs({
          what: subscription.titleQuery,
          where: subscription.location,
          page,
          results_per_page: RESULTS_PER_PAGE,
        });
      } catch (error) {
        console.error("[pipeline] adzuna fetch failed", error);
        break;
      }

      if (!jobs.length) {
        break;
      }

      for (const job of jobs) {
        const normalizedJob = toNormalizedJob(job);
        if (!normalizedJob.url) {
          continue;
        }
        const score = scoreMatch(matchContext, normalizedJob);

        if (!isMatch(matchContext, normalizedJob, MATCH_THRESHOLD)) {
          continue;
        }

        const jobListing = await upsertJobListing(normalizedJob);
        const sentAlert = await createSentAlert({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          jobListingId: jobListing.id,
          score,
        });

        if (!sentAlert) {
          continue;
        }

        matches.push(normalizedJob);
        createdAlertIds.push(sentAlert.id);
      }
    }

    if (!matches.length) {
      continue;
    }

    if (subscription.frequency === "IMMEDIATE") {
      let successfulSends = 0;
      for (let i = 0; i < matches.length; i += 1) {
        const job = matches[i];
      const response = await sendImmediateEmail(subscription.userId, job);
      console.log("[job-alerts] sendImmediateEmail response:", {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        jobTitle: job.title,
        response,
      });
      if (response?.success) {
        const alertId = createdAlertIds[i];
        if (alertId) {
          await db.sentJobAlert.update({
            where: { id: alertId },
            data: { delivered: true, sentAt: new Date() },
          });
        }
        successfulSends += 1;
      }
      }
      if (successfulSends > 0) {
        await db.jobAlertSubscription.update({
          where: { id: subscription.id },
          data: { lastSentAt: new Date() },
        });
      }
    } else {
      digestQueue.push({
        subscriptionId: subscription.id,
        userId: subscription.userId,
        jobs: matches,
        alertIds: createdAlertIds,
      });
    }
  }

  for (const digest of digestQueue) {
    const subscription = subscriptions.find(
      (sub) => sub.id === digest.subscriptionId
    );
    if (!subscription) continue;
    if (!shouldSendDigest(subscription)) continue;

    const response = await sendDigestEmail(digest.userId, digest.jobs);
    console.log("[job-alerts] sendDigestEmail response:", {
      subscriptionId: digest.subscriptionId,
      userId: digest.userId,
      response,
    });

    if (response?.success) {
      await db.sentJobAlert.updateMany({
        where: { id: { in: digest.alertIds } },
        data: { delivered: true, sentAt: new Date() },
      });

      await db.jobAlertSubscription.update({
        where: { id: digest.subscriptionId },
        data: { lastSentAt: new Date() },
      });
    }
  }

  return {
    processed: subscriptions.length,
    trigger: options.trigger ?? "manual",
    digests: digestQueue.length,
  };
};

