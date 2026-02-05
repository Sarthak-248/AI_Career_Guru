import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Adjust import path based on where we reference the component
import DashboardView from "./(main)/dashboard/_component/dashboard-view";
import { useAuth } from "@clerk/clerk-react";

export default function DashboardPage() {
  const [insights, setInsights] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    async function fetchData() {
        try {
            const userRes = await fetch("/api/user/onboarding-status");
            const userData = await userRes.json();
            
            if (!userData.isOnboarded) {
                navigate("/onboarding");
                return;
            }

            // Fetch industry insights - needs backend implementation
            const insightsRes = await fetch("/api/dashboard/insights");
            if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                setInsights(insightsData);
            }

            // Fetch skill analysis - needs backend implementation in dashboard route (TODO)
             // const skillRes = await fetch("/api/dashboard/skill-gap");
             // ...
             
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }
    fetchData();
  }, [isLoaded, userId, navigate]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto py-6">
      <DashboardView insights={insights} skillAnalysis={skillAnalysis} />
    </div>
  );
}
