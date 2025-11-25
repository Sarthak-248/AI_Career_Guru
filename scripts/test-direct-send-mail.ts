import { sendMail } from "@/lib/mailer";

async function testDirectSendMail() {
  try {
    const sendOptions = {
      to: "test@your-verified-domain.com",  // Replace with your verified domain email
      subject: "Test email from AI Career Coach",
      text: "This is a test email sent directly using the mailer function.",
      html: "<p>This is a test email sent directly using the mailer function.</p>",
      unsubscribeUrl: "/alerts",
    };

    const result = await sendMail(sendOptions);
    console.log("Direct sendMail result:", result);
  } catch (error) {
    console.error("Error sending direct test mail:", error);
  }
}

testDirectSendMail();
