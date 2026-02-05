// client/src/pages/interview/page.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import { getAssessments } from "@/api/interview";
import useFetch from "@/hooks/use-fetch";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function InterviewPrepPage() {
    const { isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    
    const {
        loading,
        fn: fetchAssessments,
        data: assessments,
    } = useFetch((token) => getAssessments(token));

    useEffect(() => {
        const load = async () => {
            if (isLoaded && isSignedIn) {
                const token = await getToken();
                fetchAssessments(token);
            }
        };
        load();
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold gradient-title">Interview Prep</h1>
                    <p className="text-muted-foreground mt-1">Practice with AI-generated questions</p>
                </div>
                <Link to="/interview/mock">
                    <Button>Start AI Quiz</Button>
                </Link>
            </div>

            <StatsCards assessments={assessments} />
            <PerformanceChart assessments={assessments} />
            <QuizList assessments={assessments} />
        </div>
    );
}
