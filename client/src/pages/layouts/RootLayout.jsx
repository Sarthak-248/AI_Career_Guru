import { Toaster } from "sonner";
import { useEffect } from "react";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function RootLayout() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      // Sync user with backend
      fetch('/api/user/sync', { method: 'POST' }).catch(console.error);
    }
  }, [isLoaded, userId]);

  useEffect(() => {
     // Chatling Script
     window.chtlConfig = { chatbotId: "1876756143" };
     const script = document.createElement('script');
     script.src = "https://chatling.ai/js/embed.js";
     script.async = true;
     script.dataset.id = "chtl-script";
     document.body.appendChild(script);

     return () => {
         document.body.removeChild(script);
     }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Header />
      <main className="min-h-screen pt-20">
          <Outlet /> 
      </main>
      <Toaster richColors />
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-200">
          <p>Made with 💗 by Sarthak</p>
        </div>
      </footer>
    </ThemeProvider>
  );
}

