import { getIndustryInsights, getSkillGapAnalysis } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();
  const skillAnalysis = await getSkillGapAnalysis();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} skillAnalysis={skillAnalysis} />
    </div>
  );
}
