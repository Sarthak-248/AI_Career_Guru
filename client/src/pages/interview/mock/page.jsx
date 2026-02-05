// client/src/pages/interview/mock/page.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Quiz from '../_components/quiz';

export default function MockInterviewPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2 mb-6">
        <Link to="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Prep
          </Button>
        </Link>
        <h1 className="text-4xl font-bold gradient-title">AI Mock Interview</h1>
        <p className="text-muted-foreground">
           Answer these AI-generated technical questions based on your profile.
        </p>
      </div>

      <Quiz />
    </div>
  );
}
