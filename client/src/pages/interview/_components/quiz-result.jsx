// client/src/pages/interview/_components/quiz-result.jsx
import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({ result, hideStartNew = false, onStartNew }) {
  if (!result) return null;

  const { quizScore, improvementTip, questions } = result;

  return (
    <div className="mx-auto space-y-6">
      <h1 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h1>

      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{quizScore.toFixed(0)}%</h3>
          <Progress value={quizScore} className="w-full" />
        </div>

        {/* Improvement Tip */}
        {improvementTip && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">Improvement Tip:</p>
            <p className="text-muted-foreground">{improvementTip}</p>
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>
          {questions.map((q, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 space-y-2 ${
                q.isCorrect ? "bg-green-50/50" : "bg-red-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Correct Answer: {q.answer}
                </p>
                {!q.isCorrect && (
                  <p className="text-red-500">Your Answer: {q.userAnswer}</p>
                )}
              </div>
              <div className="text-sm bg-background/50 p-2 rounded">
                 <p className="font-semibold text-xs">Explanation:</p>
                 <p className="text-muted-foreground">{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
