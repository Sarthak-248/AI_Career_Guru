// client/src/pages/ai-cover-letter/_components/cover-letter-list.jsx
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/api/cover-letter";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

export default function CoverLetterList({ coverLetters, setCoverLetters }) {
  const router = useNavigate();
  const { getToken } = useAuth();
  
  if (!coverLetters?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cover Letters Yet</CardTitle>
          <CardDescription>
            Create your first cover letter to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      await deleteCoverLetter(id, token);
      toast.success("Cover letter deleted successfully!");
      if (setCoverLetters) {
        setCoverLetters(prev => prev.filter(l => l.id !== id));
      } else {
        router.push("/ai-cover-letter"); // Refresh or redirect
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg truncate">
              {letter.jobTitle} at {letter.companyName}
            </CardTitle>
            <CardDescription>
              {format(new Date(letter.createdAt), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Link to={`/ai-cover-letter/${letter.id}`}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your cover letter.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(letter.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
