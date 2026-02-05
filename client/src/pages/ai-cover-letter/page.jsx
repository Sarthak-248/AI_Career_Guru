// client/src/pages/ai-cover-letter/page.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";
import { getCoverLetters } from "@/api/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { useAuth, useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";

export default function CoverLetterPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [letters, setLetters] = useState([]);
  
  const {
      loading: isLoading,
      fn: fetchLetters,
      data: lettersData,
  } = useFetch(async () => {
      const token = await getToken();
      return getCoverLetters(token);
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
        fetchLetters();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
      if (lettersData) {
          setLetters(lettersData);
      }
  }, [lettersData]);

  if (!isLoaded || isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
            <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
        </div>
      );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className=" flex flex-col md:flex-row gap-2 items-center justify-between mb-5 ">
        <div>
            <h1 className="text-4xl font-bold gradient-title">My Cover Letters</h1>
            <p className="text-muted-foreground mt-1">Manage and create AI-powered cover letters</p>
        </div>
        <Link to="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={letters} setCoverLetters={setLetters} />
    </div>
  );
}
