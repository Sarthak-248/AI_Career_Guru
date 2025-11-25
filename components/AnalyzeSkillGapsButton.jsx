"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AnalyzeSkillGapsButton({ className }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skill-gaps/generate", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        // Navigate to full page to view results
        router.push("/skill-gaps");
      } else {
        console.error("Failed to generate skill gaps", data.error);
        router.push("/skill-gaps");
      }
    } catch (err) {
      console.error(err);
      router.push("/skill-gaps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} className={className} disabled={loading} variant="outline">
      {loading ? "Analyzing..." : "Analyze Skill Gaps"}
    </Button>
  );
}
