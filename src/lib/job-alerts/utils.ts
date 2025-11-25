import type {
  AlertFrequency,
  ExperienceLevel,
  JobAlertSubscription,
  RemotePreference,
} from "@prisma/client";

export const sanitizeSkills = (value?: string | string[] | null) => {
  if (!value) return [];

  const raw = Array.isArray(value) ? value.join(",") : value;

  return raw
    .split(/[,|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const frequencyToMs = (frequency: AlertFrequency) => {
  switch (frequency) {
    case "IMMEDIATE":
      return 0;
    case "DAILY":
      return 1000 * 60 * 60 * 24;
    case "WEEKLY":
      return 1000 * 60 * 60 * 24 * 7;
    default:
      return 0;
  }
};

export const shouldSendDigest = (
  subscription: Pick<JobAlertSubscription, "lastSentAt" | "frequency">
) => {
  if (!subscription.lastSentAt) return true;
  const elapsed = Date.now() - new Date(subscription.lastSentAt).getTime();
  return elapsed >= frequencyToMs(subscription.frequency);
};

export const asExperienceLevel = (value?: string): ExperienceLevel => {
  if (value === "ENTRY" || value === "MID" || value === "SENIOR") {
    return value;
  }
  return "MID";
};

export const asFrequency = (value?: string): AlertFrequency => {
  if (value === "IMMEDIATE" || value === "DAILY" || value === "WEEKLY") {
    return value;
  }
  return "DAILY";
};

export const asRemotePreference = (value?: string): RemotePreference => {
  if (
    value === "REMOTE" ||
    value === "ONSITE" ||
    value === "HYBRID" ||
    value === "FLEXIBLE"
  ) {
    return value;
  }
  return "FLEXIBLE";
};

