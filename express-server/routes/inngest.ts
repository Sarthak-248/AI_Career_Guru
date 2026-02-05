import { serve } from "inngest/express";
import { inngest } from "../lib/inngest/client";
import { generateIndustryInsights } from "../lib/inngest/functions";

export default serve({
  client: inngest,
  functions: [generateIndustryInsights],
});
