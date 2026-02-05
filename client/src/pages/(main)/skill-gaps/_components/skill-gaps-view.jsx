"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SkillGapsView({ skillAnalysis }) {
  const lp = skillAnalysis?.learningPath?.learningPath || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Skill Gap Analysis</h1>
          <p className="text-sm text-muted-foreground">Personalized learning path and resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Missing Skills</CardTitle>
            <CardDescription>User skills not matching industry recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {skillAnalysis?.missingSkills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillAnalysis.missingSkills.map((s) => (
                  <Badge key={s} variant="destructive">{s}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No missing skills detected.</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Learning Path & Resources</CardTitle>
            <CardDescription>Step-by-step recommendations to close your gaps</CardDescription>
          </CardHeader>
          <CardContent>
            {lp && lp.length > 0 ? (
              <div className="space-y-4">
                {lp.map((item) => (
                  <div key={item.skill} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{item.skill}</div>
                      <div className="text-sm text-muted-foreground">{item.priority}</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Estimated hours: {item.estimatedHours || '—'}</div>
                    <div className="mt-2">
                      <ul className="list-decimal pl-5 text-sm space-y-1">
                        {(item.steps || []).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {item.resources && item.resources.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Resources</div>
                        <ul className="space-y-2">
                          {item.resources.map((r, i) => (
                            <li key={i}>
                              <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">{r.title || r.url}</a>
                              <div className="text-xs text-muted-foreground">{r.type}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No learning path available yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
