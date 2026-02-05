// client/src/pages/interview/_components/performance-chart.jsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
        // Reverse to show chronological order for chart
        const rev = [...assessments].reverse();
        const data = rev.map((a) => ({
            date: format(new Date(a.createdAt), "MMM d"),
            score: a.quizScore,
        }));
        setChartData(data);
    }
  }, [assessments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="date" />
               <YAxis domain={[0, 100]} />
               <Tooltip />
               <Line
                 type="monotone"
                 dataKey="score"
                 stroke="hsl(var(--primary))"
                 strokeWidth={2}
               />
             </LineChart>
           </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground">
                 No enough data to show trend.
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
