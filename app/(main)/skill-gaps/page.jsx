import { getSkillGapAnalysis } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import SkillGapsView from "./_components/skill-gaps-view";

export default async function SkillGapsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const skillAnalysis = await getSkillGapAnalysis();

  return (
    <div className="container mx-auto py-8">
      <SkillGapsView skillAnalysis={skillAnalysis} />
    </div>
  );
}
