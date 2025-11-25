import { NextResponse } from "next/server";
import { getSkillGapAnalysis } from "@/actions/dashboard";

export async function POST(req) {
  try {
    const analysis = await getSkillGapAnalysis();
    return NextResponse.json({ ok: true, analysis });
  } catch (err) {
    console.error("/api/skill-gaps/generate error", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
