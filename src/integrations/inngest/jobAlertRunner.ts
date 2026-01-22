import { inngest } from "@/lib/inngest/client";
import { runJobAlertPipeline } from "@src/lib/job-alerts/pipeline";

export const jobAlertRunner = inngest.createFunction(
  { id: "job-alert-runner", name: "Job Alert Runner" },
  { cron: "0 * * * *" },
  async () => {
    const result = await runJobAlertPipeline({ trigger: "scheduled" });
    return result;
  }
);




