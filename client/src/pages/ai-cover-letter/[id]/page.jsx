// client/src/pages/ai-cover-letter/[id]/page.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/api/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { useAuth, useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import { CoverLetterPreview } from "../_components/cover-letter-preview";

export default function CoverLetterDetail() {
  const { id } = useParams();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [letter, setLetter] = useState(null);

  const {
      loading: isLoading,
      fn: fetchLetter,
      data: letterData,
      error
  } = useFetch(async () => {
      const token = await getToken();
      return getCoverLetter(id, token);
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && id) {
        fetchLetter();
    }
  }, [isLoaded, isSignedIn, id]);

  useEffect(() => {
      if (letterData) {
          setLetter(letterData);
      }
  }, [letterData]);

  if (!isLoaded || isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
        </div>
      );
  }

  if (error || !letter) {
      return (
          <div className="container mx-auto py-6">
              <p>Cover Letter not found.</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <Link to="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
        <h1 className="text-4xl font-bold gradient-title">
          {letter.jobTitle} at {letter.companyName}
        </h1>
      </div>

      <CoverLetterPreview content={letter.content} />
    </div>
  );
}
