import { describe, expect, it } from "vitest";

import { isMatch, scoreMatch } from "../src/lib/matching";

const baseSubscription = {
  titleQuery: "Software Engineer",
  skills: ["react", "node"],
  location: "bengaluru",
  remotePreference: "FLEXIBLE",
  experienceLevel: "MID",
};

const baseJob = {
  title: "Software Engineer",
  company: "Acme Corp",
  location: "Bengaluru, India",
  isRemote: false,
};

describe("matching", () => {
  it("scores exact title matches above threshold", () => {
    expect(isMatch(baseSubscription, baseJob, 6)).toBe(true);
  });

  it("scores partial title matches", () => {
    const job = { ...baseJob, title: "Principal Engineer" };
    const subscription = { ...baseSubscription, titleQuery: "Engineer" };
    expect(isMatch(subscription, job, 4)).toBe(true);
  });

  it("adds weight for overlapping skills", () => {
    const job = { ...baseJob, title: "React Developer" };
    const score = scoreMatch(baseSubscription, job);
    expect(score).toBeGreaterThanOrEqual(6);
  });

  it("rewards remote friendly matches", () => {
    const subscription = { ...baseSubscription, remotePreference: "REMOTE" };
    const job = { ...baseJob, isRemote: true };
    expect(isMatch(subscription, job, 6)).toBe(true);
  });

  it("penalizes experience mismatches", () => {
    const subscription = { ...baseSubscription, experienceLevel: "SENIOR" };
    const job = { ...baseJob, title: "Junior Developer" };
    const seniorScore = scoreMatch(subscription, job);
    const entryScore = scoreMatch(
      { ...subscription, experienceLevel: "ENTRY" },
      job
    );
    expect(seniorScore).toBeLessThan(entryScore);
  });

  it("dedupes repeated title tokens", () => {
    const subscription = { ...baseSubscription, titleQuery: "Engineer Engineer" };
    const score = scoreMatch(subscription, baseJob);
    expect(score).toBe(scoreMatch({ ...baseSubscription, titleQuery: "Engineer" }, baseJob));
  });
});




