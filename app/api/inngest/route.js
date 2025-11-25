import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/function";
import { jobAlertRunner } from "@src/integrations/inngest/jobAlertRunner";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights, jobAlertRunner],
});
