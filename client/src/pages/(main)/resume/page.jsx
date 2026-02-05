import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ResumeBuilder from "./_components/resume-builder";
import { useAuth } from "@clerk/clerk-react";

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/resume", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResume(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
