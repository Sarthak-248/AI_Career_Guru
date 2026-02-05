import { useCallback, useMemo, useState, useTransition } from "react";
import { useAuth } from "@clerk/clerk-react";
import { JobAlertForm } from "@/components/JobAlertForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AlertsClient({ initialSubscriptions }) {
  const [subscriptions, setSubscriptions] =
    useState(initialSubscriptions);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const { getToken } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Unable to refresh alerts");
      }
      const body = await response.json();
      setSubscriptions(body.subscriptions ?? []);
    } catch (error) {
      console.error(error);
    }
  }, [getToken]);

  const runAction = useCallback(
    (action) => {
      startTransition(() => {
        setMessage(null);
        action()
          .then(() => refresh())
          .catch((error) => {
            setMessage(error.message ?? "Something went wrong.");
          });
      });
    },
    [refresh]
  );

  const handleToggle = (id) =>
    runAction(async () => {
      const token = await getToken();
      const response = await fetch(`/api/alerts/${id}/toggle`, { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Unable to update alert.");
    });

  const handleDelete = (id) =>
    runAction(async () => {
      const confirmed = window.confirm(
        "Delete this alert? Matches already sent will stay in history."
      );
      if (!confirmed) return;
      const token = await getToken();
      const response = await fetch(`/api/alerts/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Unable to delete alert.");
    });

  const handleManualRun = () =>
    runAction(async () => {
      const token = await getToken();
      const response = await fetch("/api/alerts/run", { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Runner failed. Check logs.");
      setMessage("Runner triggered. Check your inbox for matches.");
    });

  const history = useMemo(() => {
    return subscriptions
      .flatMap((subscription) =>
        subscription.sentAlerts.map((alert) => ({
          id: alert.id,
          subscriptionTitle: subscription.titleQuery,
          createdAt: alert.createdAt,
          delivered: alert.delivered,
          job: alert.jobListing,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 20);
  }, [subscriptions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Manage alert cadence, toggle delivery, or remove outdated searches.
          </p>
        </div>
        <Button onClick={handleManualRun} disabled={isPending}>
          {isPending ? "Working..." : "Run now"}
        </Button>
      </div>

      <JobAlertForm onCreated={refresh} />

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {subscriptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No subscriptions yet</CardTitle>
            <CardDescription>
              Create your first alert above to start receiving curated matches.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{subscription.titleQuery}</span>
                <Badge variant={subscription.isActive ? "default" : "secondary"}>
                  {subscription.frequency.toLowerCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscription.location || "Any location"} • {subscription.skills.join(", ") || "Any skill"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Experience: {subscription.experienceLevel} • Alerts created{" "}
                {new Date(subscription.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleToggle(subscription.id)}
                >
                  {subscription.isActive ? "Pause" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => handleDelete(subscription.id)}
                >
                  Delete
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent alerts</p>
                <ul className="space-y-1 text-sm">
                  {subscription.sentAlerts.slice(0, 3).map((alert) => (
                    <li key={alert.id} className="text-muted-foreground">
                      {alert.jobListing?.title ?? "Pending job"} —{" "}
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                  {subscription.sentAlerts.length === 0 && (
                    <li className="text-muted-foreground">No alerts yet.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Delivery history</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Alerts will appear here after the first run.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {history.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.subscriptionTitle}</span>
                  <Badge variant={item.delivered ? "default" : "secondary"}>
                    {item.delivered ? "Delivered" : "Queued"}
                  </Badge>
                </div>
                <p className="text-sm">
                  {item.job?.title ?? "Pending listing"} —{" "}
                  {item.job?.company ?? "Company hidden"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
