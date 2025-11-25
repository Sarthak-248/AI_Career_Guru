import type { JobAlertSubscription, JobListing } from "@prisma/client";

import type { NormalizedAdzunaJob } from "./adzuna";

type SubscriptionInput =
  | Pick<
      JobAlertSubscription,
      | "titleQuery"
      | "skills"
      | "location"
      | "remotePreference"
      | "experienceLevel"
    >
  | {
      titleQuery: string;
      skills: string[];
      location?: string | null;
      remotePreference: string;
      experienceLevel: string;
    };

type JobInput =
  | Pick<JobListing, "title" | "company" | "location" | "isRemote">
  | NormalizedAdzunaJob;

const TITLE_WEIGHT = 2;
const SKILL_WEIGHT = 2;
const LOCATION_WEIGHT = 4;
const REMOTE_WEIGHT = 4;
const EXPERIENCE_WEIGHT = 2;

const LEVEL_KEYWORDS: Record<string, string[]> = {
  ENTRY: ["intern", "junior", "entry"],
  MID: ["mid", "mid-level", "associate"],
  SENIOR: ["senior", "lead", "principal", "staff"],
};

const tokenize = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .split(/[\s/,+-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

const normalizeSkills = (skills?: string[] | null) =>
  (skills ?? [])
    .map((skill) => skill.toLowerCase().trim())
    .filter(Boolean);

const determineLevelFromTitle = (title: string): string | null => {
  const lowerTitle = title.toLowerCase();

  for (const [level, keywords] of Object.entries(LEVEL_KEYWORDS)) {
    if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return level;
    }
  }

  return null;
};

const remoteMatchesPreference = (
  preference: string,
  isRemote: boolean
): boolean => {
  if (preference === "FLEXIBLE") return true;
  if (preference === "REMOTE") return isRemote;
  if (preference === "ONSITE") return !isRemote;
  return true;
};

export const scoreMatch = (
  subscription: SubscriptionInput,
  job: JobInput
): number => {
  let score = 0;
  const subscriptionTitleTokens = Array.from(
    new Set(tokenize(subscription.titleQuery))
  );
  const jobTitleTokens = tokenize(job.title);

  // Reward exact keyword matches in the job title (2 points each).
  for (const token of subscriptionTitleTokens) {
    if (jobTitleTokens.includes(token)) {
      score += TITLE_WEIGHT;
    }
  }

  const subscriptionSkills = Array.from(
    new Set(normalizeSkills(subscription.skills))
  );
  const jobText = `${job.title ?? ""} ${job.company ?? ""}`.toLowerCase();

  // Give weight for every declared skill that appears anywhere in the job metadata.
  for (const skill of subscriptionSkills) {
    if (jobText.includes(skill)) {
      score += SKILL_WEIGHT;
    }
  }

  const wantedLocation = (subscription.location ?? "").toLowerCase().trim();
  const jobLocation = (job.location ?? "").toLowerCase().trim();

  // Location is an exact/contains match because many listings append sub-localities.
  if (wantedLocation && jobLocation && jobLocation.includes(wantedLocation)) {
    score += LOCATION_WEIGHT;
  }

  // Remote match is binary: either the preference aligns or it does not.
  if (remoteMatchesPreference(subscription.remotePreference, !!job.isRemote)) {
    score += REMOTE_WEIGHT;
  }

  // Experience heuristics look for seniority cues inside the job title.
  const jobLevel = determineLevelFromTitle(job.title ?? "");
  if (!jobLevel || jobLevel === subscription.experienceLevel) {
    score += EXPERIENCE_WEIGHT;
  }

  return score;
};

export const isMatch = (
  subscription: SubscriptionInput,
  job: JobInput,
  threshold = 6
) => scoreMatch(subscription, job) >= threshold;

