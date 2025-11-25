import "dotenv/config";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL;

console.log("Testing SMTP configuration:");
console.log(`SMTP_HOST: ${SMTP_HOST}`);
console.log(`SMTP_PORT: ${SMTP_PORT}`);
console.log(`SMTP_USER: ${SMTP_USER}`);
console.log(`FROM_EMAIL: ${FROM_EMAIL}`);

async function testMailtrap() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error(
      "Missing SMTP config. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env"
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    console.log("\n📧 Testing SMTP connection and sending test email...");
    const info = await transporter.sendMail({
      from: FROM_EMAIL || "test@example.com",
      to: "test@mailtrap.io",
      subject: "Test Email from AI Career Coach",
      text: "This is a test email from the AI Career Coach mailer with Mailtrap SMTP.",
      html: "<p>This is a test email from the AI Career Coach mailer with Mailtrap SMTP.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\nYou should see this email in your Mailtrap inbox: https://mailtrap.io/inboxes");
  } catch (error: any) {
    console.error("❌ Error sending test email:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

testMailtrap();
