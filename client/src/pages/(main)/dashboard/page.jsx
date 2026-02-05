import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DashboardView from "./_component/dashboard-view";
import { useAuth } from "@clerk/clerk-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    insights: null,
    skillAnalysis: null,
  });

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const token = await getToken();
        // Check onboarding
        const onboardingRes = await fetch("/api/user/onboarding-status", {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (onboardingRes.ok) {
          const onboardingData = await onboardingRes.json();
          if (!onboardingData.isOnboarded) {
            navigate("/onboarding");
            return;
          }
        }

        // Load concurrent data
        const [insightsRes, skillRes] = await Promise.all([
          fetch("/api/dashboard/insights", {
              headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("/api/skill-gaps", {
              headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        let insights = null;
        let skillAnalysis = null;

        if (insightsRes.ok) {
          insights = await insightsRes.json();
        }
        if (skillRes.ok) {
          const skillData = await skillRes.json();
          // Server returns { ok: true, analysis: ... }
          skillAnalysis = skillData.analysis || null;
        }

        setData({ insights, skillAnalysis });
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndLoadData();
  }, [navigate, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DashboardView insights={data.insights} skillAnalysis={data.skillAnalysis} />
    </div>
  );
}
