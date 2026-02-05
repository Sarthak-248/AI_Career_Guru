import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import SkillGapsView from "./_components/skill-gaps-view";
import { Button } from "@/components/ui/button";

export default function SkillGapsPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const init = async () => {
      try {
        const token = await getToken();
        
        // 1. Check onboarding status
        const onboardingRes = await fetch("/api/user/onboarding-status", {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!onboardingRes.ok) {
           throw new Error("Failed to check onboarding status");
        }
        
        const onboardingData = await onboardingRes.json();
        
        if (!onboardingData.isOnboarded) {
            navigate("/onboarding");
            return;
        }

        // 2. Fetch Skill Analysis
        setAnalyzing(true);
        const analysisRes = await fetch("/api/skill-gaps/generate", {
           method: "POST",
           headers: { Authorization: `Bearer ${token}` }
        });

        if (!analysisRes.ok) {
            throw new Error("Failed to generate skill gaps analysis");
        }

        const data = await analysisRes.json();
        setSkillAnalysis(data.analysis);

      } catch (err) {
        console.error("Skill gaps page error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    init();
  }, [isLoaded, userId, getToken, navigate]);

  if (loading || analyzing) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Analyzing your profile...</h2>
        <p className="text-muted-foreground">Identifying skill gaps and learning opportunities.</p>
        
        {/* Simple Spinner */}
        <div className="mt-8 flex justify-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
     return (
        <div className="container mx-auto py-20 text-center text-red-500">
           <p>Error: {error}</p>
           <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-8">
      <SkillGapsView skillAnalysis={skillAnalysis} />
    </div>
  );
}
