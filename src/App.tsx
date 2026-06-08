import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SetupLoading from "./pages/SetupLoading";
import NotFound from "./pages/NotFound";

const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const ConnectAccounts = React.lazy(() => import("./pages/ConnectAccounts"));
const CreatePost = React.lazy(() => import("./pages/CreatePost"));
const BulkSchedule = React.lazy(() => import("./pages/BulkSchedule"));
const ContentStudio = React.lazy(() => import("./pages/ContentStudio"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const Scheduled = React.lazy(() => import("./pages/Scheduled"));
const Posted = React.lazy(() => import("./pages/Posted"));
const Drafts = React.lazy(() => import("./pages/Drafts"));
const PostingQueue = React.lazy(() => import("./pages/PostingQueue"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Team = React.lazy(() => import("./pages/Team"));
const Workspaces = React.lazy(() => import("./pages/Workspaces"));
const Help = React.lazy(() => import("./pages/Help"));
const Discount = React.lazy(() => import("./pages/Discount"));
const DiscountPricing = React.lazy(() => import("./pages/DiscountPricing"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
import { AppLayout } from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute, PublicOnlyRoute, AuthOnlyRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { TeamProvider } from "./context/TeamContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WorkspaceSwitchScreen } from "./components/WorkspaceSwitchScreen";

const queryClient = new QueryClient();

const FullPageLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center animate-pulse">
        <div className="h-10 w-auto flex items-center justify-center">
          <span className="text-2xl font-black tracking-tight text-foreground">Ship<span className="text-[#FF6154]">OS</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#FF6154] rounded-none animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 bg-[#FF6154] rounded-none animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 bg-[#FF6154] rounded-none animate-bounce" />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <WorkspaceProvider>
            {/* Workspace switch loading screen — always mounted so it reacts instantly */}
            <WorkspaceSwitchScreen />
            <TeamProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                <BrowserRouter>
                <ScrollToTop />
                <React.Suspense fallback={<FullPageLoading />}>
                  <Routes>
                  {/* ── Public pages ─────────────────────────────── */}
                  <Route path="/" element={<Index />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/discount" element={<Discount />} />
                  <Route path="/claim-discount" element={<DiscountPricing />} />

                  {/* ── Auth pages (redirect to dashboard if already logged in) ── */}
                  <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                  <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />

                  {/* ── Onboarding (auth required, but onboarding-completion check skipped) ── */}
                  <Route path="/onboarding" element={<AuthOnlyRoute><Onboarding /></AuthOnlyRoute>} />
                  <Route path="/setup-loading" element={<SetupLoading />} />

                  {/* ── Protected dashboard routes ────────────────── */}
                  <Route path="/connect-accounts" element={
                    <ProtectedRoute>
                      <AppLayout><ConnectAccounts /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/create-post" element={
                    <ProtectedRoute>
                      <AppLayout><CreatePost /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/bulk-schedule" element={
                    <ProtectedRoute>
                      <AppLayout><BulkSchedule /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/content-studio" element={
                    <ProtectedRoute>
                      <AppLayout><ContentStudio /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <AppLayout><Analytics /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <AppLayout><Calendar /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/scheduled" element={
                    <ProtectedRoute>
                      <AppLayout><Scheduled /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/posting-queue" element={
                    <ProtectedRoute>
                      <AppLayout><PostingQueue /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/posted" element={
                    <ProtectedRoute>
                      <AppLayout><Posted /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/drafts" element={
                    <ProtectedRoute>
                      <AppLayout><Drafts /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Navigate to="/settings?tab=account" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <AppLayout><Settings /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/team" element={
                    <ProtectedRoute>
                      <AppLayout><Team /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/workspaces" element={
                    <ProtectedRoute>
                      <AppLayout><Workspaces /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/help" element={
                    <ProtectedRoute>
                      <AppLayout><Help /></AppLayout>
                    </ProtectedRoute>
                  } />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </React.Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </TeamProvider>
      </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
