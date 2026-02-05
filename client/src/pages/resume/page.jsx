import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import ResumeBuilder from "./_components/resume-builder";
import useFetch from "@/hooks/use-fetch";
import { getResume } from "@/api/resume";
import { BarLoader } from "react-spinners";

export default function ResumePage() {
  const { isLoaded } = useUser();
  const { getToken } = useAuth();
  
  const {
    loading: isResumeLoading,
    fn: getResumeFn,
    data: resume,
  } = useFetch((token) => getResume(token));

  useEffect(() => {
     const fetchResume = async () => {
        if (isLoaded) {
            const token = await getToken();
            getResumeFn(token);
        }
    };
    fetchResume();
  }, [isLoaded]);

  if (!isLoaded || isResumeLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
