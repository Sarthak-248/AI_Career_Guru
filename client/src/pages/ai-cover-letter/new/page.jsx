// client/src/pages/ai-cover-letter/new/page.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CoverLetterGenerator from '../_components/cover-letter-generator';

export default function NewCoverLetterPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <Link to="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
        <h1 className="text-6xl font-bold gradient-title">Create New Cover Letter</h1>
        <p className="text-muted-foreground">
          Generate a tailored cover letter for your next job application
        </p>
      </div>

      <CoverLetterGenerator />
    </div>
  );
}
