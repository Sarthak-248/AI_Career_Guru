import { serve } from "inngest/express";
import { inngest } from "../lib/inngest/client.js";
import { generateIndustryInsights } from "../lib/inngest/functions.js";

export default serve({
  client: inngest,
  functions: [generateIndustryInsights],
});
