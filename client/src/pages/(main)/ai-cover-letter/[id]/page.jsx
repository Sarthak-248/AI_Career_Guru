import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default function EditCoverLetterPage() {
  const { id } = useParams();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      try {
        const response = await fetch(`/api/cover-letter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCoverLetter(data);
        }
      } catch (error) {
        console.error("Failed to fetch cover letter", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoverLetter();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link to="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-6xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      <CoverLetterPreview content={coverLetter?.content} />
    </div>
  );
}
