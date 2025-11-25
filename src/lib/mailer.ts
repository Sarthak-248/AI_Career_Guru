import "@/lib/env-normalize";
import nodemailer from "nodemailer";
import { Resend } from "resend";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import type { NormalizedAdzunaJob } from "./adzuna";

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "no-reply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const transporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

const buildUnsubscribeUrl = () => {
  if (!APP_URL) {
    // Fallback to plain "/alerts" path without full domain if NEXT_PUBLIC_APP_URL not set
    return "/alerts";
  }
  return `${APP_URL.replace(/\/$/, "")}/alerts`;
};

const buildImmediateTemplate = (
  userName: string,
  job: NormalizedAdzunaJob
) => {
  const unsubscribeUrl = buildUnsubscribeUrl();
  const jobUrl = job.url || unsubscribeUrl;

  return {
    subject: `🎯 ${job.title} @ ${job.company ?? "Top Company"}`,
    text: [
      `Hi ${userName || "there"},`,
      "",
      `We found a new role that matches your alert: ${job.title} at ${job.company ?? "an employer"}.`,
      `View the listing: ${jobUrl}`,
      "",
      `Update or unsubscribe: ${unsubscribeUrl}`,
    ].join("\n"),
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 20px; background: #ffffff; }
            .job-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .job-title { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0; }
            .job-company { font-size: 16px; color: #667eea; font-weight: 600; margin: 0 0 8px 0; }
            .job-detail { font-size: 14px; color: #666; margin: 6px 0; display: flex; align-items: center; }
            .job-detail strong { min-width: 80px; }
            .badge { display: inline-block; background: #e0e7ff; color: #667eea; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px 4px 4px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 16px; }
            .cta-button:hover { opacity: 0.95; }
            .footer { padding: 30px 20px; background: #f8f9fa; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
            .footer a { color: #667eea; text-decoration: none; }
            .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
            .remote-badge { background: #dcfce7; color: #15803d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Perfect Match Found!</h1>
              <p>AI Career Coach - Job Alerts</p>
            </div>
            <div class="content">
              <p>Hi <strong>${userName || "there"}</strong>,</p>
              <p>Great news! We found a job that matches your profile and interests:</p>
              
              <div class="job-card">
                <div class="job-title">${job.title}</div>
                <div class="job-company">${job.company ?? "Company hidden"}</div>
                <div class="divider"></div>
                <div class="job-detail">
                  <strong>📍 Location:</strong> ${job.location ?? "Location not provided"}
                </div>
                ${job.isRemote ? '<div class="job-detail"><span class="badge remote-badge">🌍 Remote Opportunity</span></div>' : ''}
                ${job.created ? `<div class="job-detail"><strong>⏰ Posted:</strong> ${new Date(job.created).toLocaleDateString()}</div>` : ''}
              </div>

              <p style="text-align: center;">
                <a href="${jobUrl}" class="cta-button" target="_blank" rel="noreferrer">View Full Job Listing →</a>
              </p>

              <p style="font-size: 13px; color: #666; margin-top: 30px;">
                This is one of many jobs we'll send your way. We continuously search and match opportunities to your profile.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;">
                <a href="${unsubscribeUrl}">Manage Your Alerts</a> • 
                <a href="${unsubscribeUrl}">Unsubscribe</a>
              </p>
              <p style="margin: 0; opacity: 0.7;">
                © AI Career Coach. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};

const buildDigestTemplate = (
  userName: string,
  jobs: NormalizedAdzunaJob[]
) => {
  const unsubscribeUrl = buildUnsubscribeUrl();
  const subject =
    jobs.length === 1
      ? `📧 1 job match waiting for you`
      : `📧 ${jobs.length} job matches waiting for you`;

  const items = jobs
    .map(
      (job, index) => `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #1a202c; font-size: 16px; margin-bottom: 6px;">
              ${index + 1}. ${job.title}
            </div>
            <div style="color: #667eea; font-weight: 600; margin-bottom: 6px;">
              ${job.company ?? "Company hidden"}
            </div>
            <div style="color: #666; font-size: 14px; margin-bottom: 6px;">
              📍 ${job.location ?? "Location not provided"}
              ${job.isRemote ? ' • 🌍 Remote' : ''}
            </div>
            <a href="${job.url}" target="_blank" rel="noreferrer" style="display: inline-block; color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px;">
              View Job →
            </a>
          </td>
        </tr>
      `
    )
    .join("");

  return {
    subject,
    text: [
      `Hi ${userName || "there"},`,
      "",
      `Here are ${jobs.length} matches from your AI Career Coach alerts:`,
      ...jobs.map(
        (job, index) =>
          `${index + 1}. ${job.title} @ ${job.company ?? "Company"} - ${job.url}`
      ),
      "",
      `Manage or unsubscribe: ${unsubscribeUrl}`,
    ].join("\n"),
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
            .header .count { font-size: 48px; font-weight: 700; margin: 16px 0 0 0; }
            .content { padding: 40px 20px; background: #ffffff; }
            .jobs-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .footer { padding: 30px 20px; background: #f8f9fa; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
            .footer a { color: #667eea; text-decoration: none; }
            .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Job Matches for You</h1>
              <p>AI Career Coach - Weekly Digest</p>
              <div class="count">${jobs.length}</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName || "there"}</strong>,</p>
              <p>Here are the latest job opportunities that match your profile and interests:</p>
              
              <table class="jobs-table">
                <tbody>
                  ${items}
                </tbody>
              </table>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${unsubscribeUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  View All Matches
                </a>
              </p>

              <p style="font-size: 13px; color: #666; margin-top: 30px; text-align: center;">
                We found ${jobs.length} job${jobs.length !== 1 ? 's' : ''} matching your criteria. Don't miss these opportunities!
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;">
                <a href="${unsubscribeUrl}">Manage Your Alerts</a> • 
                <a href="${unsubscribeUrl}">Unsubscribe</a>
              </p>
              <p style="margin: 0; opacity: 0.7;">
                © AI Career Coach. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};

const getUserContact = async (userId: string) => {
  const user = await db.user.findUnique({
    select: { id: true, email: true, name: true, clerkUserId: true },
    where: { id: userId },
  });

  if (!user) return null;

  // If the user is linked to Clerk, try to fetch the latest primary email
  // from Clerk to avoid sending to a stale/demo address stored in the DB.
  try {
    if (
      user.clerkUserId &&
      (clerkClient as any) &&
      typeof (clerkClient as any).users?.getUser === "function"
    ) {
      const clerkUser = await (clerkClient as any).users.getUser(user.clerkUserId);
      const primaryEmail =
        clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.email;

      if (primaryEmail && primaryEmail !== user.email) {
        // Update DB to keep it in sync and use the fresh email
        await db.user.update({
          where: { id: user.id },
          data: { email: primaryEmail },
        });
        return { id: user.id, email: primaryEmail, name: user.name };
      }
    } else if (user.clerkUserId) {
      console.warn(
        "[mailer] clerkClient.users.getUser not available — ensure CLERK_API_KEY is set and @clerk/nextjs/server is configured. Falling back to DB email."
      );
    }
  } catch (error: any) {
    console.warn(
      "[mailer] failed to fetch email from Clerk, falling back to DB email",
      error?.message || error
    );
  }

  return { id: user.id, email: user.email, name: user.name };
};

const sendMail = async (options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
}) => {
  if (!transporter) {
    console.warn(
      "[mailer] SMTP config missing. Trying Resend fallback if available."
    );
    if (!resend) {
      console.warn(
        "[mailer] No RESEND_API_KEY configured either — skipping send. Set SMTP_* or RESEND_API_KEY to enable email delivery."
      );
      console.warn("[mailer] Skipping email send for:", {
        to: options.to,
        subject: options.subject,
        unsubscribeUrl: options.unsubscribeUrl,
        textPreview: options.text.slice(0, 100),
      });
      return { skipped: true };
    }
  }

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        headers: {
          "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
        },
      });

      console.log("[mailer] send success (SMTP)", {
        to: options.to,
        subject: options.subject,
        info,
      });
      return { success: true, info };
    }

    // Fallback to Resend if SMTP not configured
    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          headers: {
            "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
          },
        });
        console.log("[mailer] send success (Resend)", { to: options.to, subject: options.subject, sendResult });
        return { success: true, sendResult };
      } catch (error: any) {
        console.error("[mailer] Resend send failed", { to: options.to, subject: options.subject, errorMessage: error?.message });
        return { success: false, error };
      }
    }
  } catch (error: any) {
    console.error("[mailer] send failed", {
      to: options.to,
      subject: options.subject,
      errorMessage: error?.message,
      stack: error?.stack,
      textPreview: options.text.slice(0, 100),
    });
    return { success: false, error };
  }
};

export { sendMail };

export const sendImmediateEmail = async (
  userId: string,
  job: NormalizedAdzunaJob
) => {
  const user = await getUserContact(userId);
  if (!user?.email) {
    return { success: false, error: new Error("User email missing") };
  }

  console.log("[mailer] sendImmediateEmail to user email:", user.email);

  const template = buildImmediateTemplate(user.name ?? "", job);
  return sendMail({
    to: user.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    unsubscribeUrl: buildUnsubscribeUrl(),
  });
};

/**
 * Send immediate email directly to given email address, bypassing user lookup
 */
export const sendImmediateEmailByEmail = async (
  email: string,
  job: NormalizedAdzunaJob
) => {
  if (!email) {
    return { success: false, error: new Error("Email address missing") };
  }

  console.log("[mailer] sendImmediateEmailByEmail to:", email);

  const template = buildImmediateTemplate("", job);
  return sendMail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    unsubscribeUrl: buildUnsubscribeUrl(),
  });
};

export const sendDigestEmail = async (
  userId: string,
  jobs: NormalizedAdzunaJob[]
) => {
  if (!jobs.length) {
    return { success: true };
  }

  const user = await getUserContact(userId);
  if (!user?.email) {
    return { success: false, error: new Error("User email missing") };
  }

  console.log("[mailer] sendDigestEmail to user email:", user.email);

  const template = buildDigestTemplate(user.name ?? "", jobs);
  return sendMail({
    to: user.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    unsubscribeUrl: buildUnsubscribeUrl(),
  });
};

