import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default function CoverLetterPage() {
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        const response = await fetch("/api/cover-letter");
        if (response.ok) {
          const data = await response.json();
          setCoverLetters(data);
        }
      } catch (error) {
        console.error("Failed to fetch cover letters", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoverLetters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">My Cover Letters</h1>
        <Link to="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}
