import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

import { AlertsClient } from "./_components/alerts-client";

export default function AlertsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/alerts")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setSubscriptions(data.subscriptions || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load alerts", err);
          setLoading(false);
        });
    } else if (isLoaded) {
        setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  if (loading) return <div>Loading alerts...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Job Alerts</h1>
        <p className="text-muted-foreground">
          Subscribe to AI-powered job alerts and deliver them via immediate or digest emails.
        </p>
      </div>

      <AlertsClient initialSubscriptions={subscriptions} />
    </div>
  );
}
