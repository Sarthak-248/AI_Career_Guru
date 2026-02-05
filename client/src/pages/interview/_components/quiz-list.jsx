// client/src/pages/interview/_components/quiz-list.jsx
import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Assessments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments?.map((assessment, i) => (
            <Card
              key={assessment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedQuiz(assessment)}
            >
              <CardHeader>
                <CardTitle className="gradient-title text-2xl">
                  {assessment.quizScore.toFixed(0)}%
                </CardTitle>
                <CardDescription className="font-bold">
                  Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {assessment.improvementTip?.substring(0, 80)}...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {format(new Date(assessment.createdAt), "PPP p")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => setSelectedQuiz(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
