import { sendImmediateEmail } from "@/lib/mailer";

// Replace dummy userId with actual userId before running this test.
// Set the actualUserId to your logged-in user's userId in the DB.
const actualUserId = process.env.TEST_USER_ID ?? "actual-user-id-here";

const TEST_JOB = {
  title: "Test Job Title",
  company: "Test Company",
  location: "Test Location",
  url: "https://example.com/job/test-job",
  // Minimal additional fields to satisfy NormalizedAdzunaJob for the test
  sourceId: "test-1",
  created: new Date().toISOString(),
  isRemote: false,
  raw: {},
};

async function testSendEmail() {
  try {
    const result = await sendImmediateEmail(actualUserId, TEST_JOB);
    console.log("Test sendImmediateEmail result:", result);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

testSendEmail();
