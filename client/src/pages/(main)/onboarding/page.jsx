import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already onboarded
    async function checkStatus() {
       try {
         const res = await fetch("/api/user/onboarding-status");
         if (res.ok) {
           const data = await res.json();
           if (data.isOnboarded) {
             navigate("/dashboard");
           }
         }
       } catch (error) {
         console.error("Failed to check onboarding status", error);
       } finally {
         setLoading(false);
       }
    }
    checkStatus();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
