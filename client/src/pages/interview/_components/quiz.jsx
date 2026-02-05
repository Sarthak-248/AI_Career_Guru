// client/src/pages/interview/_components/quiz.jsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveAssessment } from "@/api/interview";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import QuizResult from "./quiz-result";
import { useAuth } from "@clerk/clerk-react";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const { getToken } = useAuth();
  
  const {
      loading: generating,
      fn: generateQuizFn,
      data: questions,
  } = useFetch((token) => generateQuiz(token));

  const {
      loading: saving,
      fn: saveAssessmentFn,
      data: result,
  } = useFetch((data, token) => saveAssessment(data, token));
  
  useEffect(() => {
    const startQuiz = async () => {
        const token = await getToken();
        if (token) generateQuizFn(token);
    };
    startQuiz();
  }, []);

  useEffect(() => {
    if (questions) {
        setAnswers(new Array(questions.length).fill(null));
    }
  }, [questions]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        score++;
      }
    });
    
    // Calculate percentage
    const percentage = (score / questions.length) * 100;
    
    try {
        const token = await getToken();
        const data = {
            questions,
            answers,
            score: percentage
        };
        await saveAssessmentFn(data, token);
        setShowResult(true);
    } catch (err) {
        toast.error(err.message || "Failed to save results");
    }
  };

  const startNewQuiz = async () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    const token = await getToken();
    generateQuizFn(token);
  };

  if (generating) {
    return (
        <div className="flex justify-center items-center h-[50vh]">
            <BarLoader width={"100%"} color="#36d7b7" />
        </div>
    );
  }

  // Show results
  if (showResult && result) {
    return <QuizResult result={result} onStartNew={startNewQuiz} />;
  }
  
  if (!questions || questions.length === 0) {
      return <div>Failed to load quiz.</div>;
  }

  const question = questions[currentQuestion];

  return (
    <Card className="mx-auto">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-6">{question.question}</p>
        <RadioGroup
          value={answers[currentQuestion]}
          onValueChange={handleAnswer}
        >
          {question.options.map((option, index) => (
            <div className="flex items-center space-x-2" key={index}>
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
         {saving && <BarLoader width={"100%"} color="#36d7b7" />}
        {!saving && (
            <Button onClick={handleNext} disabled={!answers[currentQuestion]}>
            {currentQuestion < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
