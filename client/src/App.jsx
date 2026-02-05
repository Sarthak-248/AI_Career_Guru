import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/(main)/dashboard/page';
import SkillGapsPage from './pages/(main)/skill-gaps/page';
import AlertsPage from './pages/alerts/page';
import ResumePage from './pages/(main)/resume/page';
import CoverLetterPage from './pages/(main)/ai-cover-letter/page';
import NewCoverLetterPage from './pages/(main)/ai-cover-letter/new/page';
import CoverLetterDetail from './pages/(main)/ai-cover-letter/[id]/page';
import InterviewPrepPage from './pages/(main)/interview/page';
import MockInterviewPage from './pages/(main)/interview/mock/page';
import OnboardingPage from './pages/(main)/onboarding/page';
import RootLayout from './pages/layouts/RootLayout';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function App() {
  return (
      <Routes>
        <Route element={<RootLayout />}>
           <Route path="/" element={<LandingPage />} />
           <Route path="/onboarding" element={
               <>
                 <SignedIn><OnboardingPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
            } />
           <Route path="/dashboard" element={
              <>
                 <SignedIn><DashboardPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/resume" element={
               <>
                 <SignedIn><ResumePage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/ai-cover-letter" element={
                <>
                 <SignedIn><CoverLetterPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/ai-cover-letter/new" element={
                <>
                 <SignedIn><NewCoverLetterPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/ai-cover-letter/:id" element={
                <>
                 <SignedIn><CoverLetterDetail /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/interview" element={
                <>
                 <SignedIn><InterviewPrepPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/interview/mock" element={
                <>
                 <SignedIn><MockInterviewPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/skill-gaps" element={
                <>
                 <SignedIn><SkillGapsPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
           <Route path="/alerts" element={
                <>
                 <SignedIn><AlertsPage /></SignedIn>
                 <SignedOut><RedirectToSignIn /></SignedOut>
               </>
           } />
        </Route>
    </Routes>
  );
}

