import "dotenv/config";

const endpoint =
  process.env.ALERTS_RUN_URL ??
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/alerts/run`
    : "http://localhost:3000/api/alerts/run");
const secret = process.env.ALERTS_RUN_SECRET;

const main = async () => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "x-cron-secret": secret } : {}),
    },
    body: JSON.stringify({ trigger: "cron" }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Runner failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  console.log("[alerts:run] success", payload);
};

main().catch((error) => {
  console.error("[alerts:run] error", error);
  process.exit(1);
});




