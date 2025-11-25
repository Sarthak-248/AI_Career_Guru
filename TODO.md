1. Update src/lib/mailer.ts to add detailed logging for sendMail:
   - Log success details after email sending.
   - Log detailed error message and stack for failure.
   - Log skipped sending when RESEND_API_KEY missing.
2. Update src/lib/job-alerts/pipeline.ts to:
   - Log sendImmediateEmail and sendDigestEmail responses (success or failure).
3. Test the changes by running the alerts runner and check logs for sending details.
4. Verify job alerts delivery status and actual email receipt in Gmail.
