import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export default function AnalyzeSkillGapsButton({ className }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skill-gaps/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        // Navigate to full page to view results
        navigate("/skill-gaps");
      } else {
        console.error("Failed to generate skill gaps", data.error);
        navigate("/skill-gaps");
      }
    } catch (err) {
      console.error(err);
      navigate("/skill-gaps");
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
