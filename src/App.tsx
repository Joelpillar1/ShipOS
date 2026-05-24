import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import ConnectAccounts from "./pages/ConnectAccounts";
import SetupLoading from "./pages/SetupLoading";
import CreatePost from "./pages/CreatePost";
import BulkSchedule from "./pages/BulkSchedule";
import Overview from "./pages/Overview";
import ContentStudio from "./pages/ContentStudio";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Scheduled from "./pages/Scheduled";
import Posted from "./pages/Posted";
import Drafts from "./pages/Drafts";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Discount from "./pages/Discount";
import DiscountPricing from "./pages/DiscountPricing";
import { AppLayout } from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/connect-accounts" element={
              <AppLayout>
                <ConnectAccounts />
              </AppLayout>
            } />
            <Route path="/setup-loading" element={<SetupLoading />} />
            <Route path="/create-post" element={
              <AppLayout>
                <CreatePost />
              </AppLayout>
            } />
            <Route path="/bulk-schedule" element={
              <AppLayout>
                <BulkSchedule />
              </AppLayout>
            } />
            <Route path="/overview" element={
              <AppLayout>
                <Overview />
              </AppLayout>
            } />
            <Route path="/content-studio" element={
              <AppLayout>
                <ContentStudio />
              </AppLayout>
            } />
            <Route path="/analytics" element={
              <AppLayout>
                <Analytics />
              </AppLayout>
            } />
            <Route path="/calendar" element={
              <AppLayout>
                <Calendar />
              </AppLayout>
            } />
            <Route path="/scheduled" element={
              <AppLayout>
                <Scheduled />
              </AppLayout>
            } />
            <Route path="/posted" element={
              <AppLayout>
                <Posted />
              </AppLayout>
            } />
            <Route path="/drafts" element={
              <AppLayout>
                <Drafts />
              </AppLayout>
            } />
            <Route path="/profile" element={
              <AppLayout>
                <Profile />
              </AppLayout>
            } />
            <Route path="/settings" element={
              <AppLayout>
                <Settings />
              </AppLayout>
            } />
            <Route path="/help" element={
              <AppLayout>
                <Help />
              </AppLayout>
            } />
            <Route path="/discount" element={<Discount />} />
            <Route path="/claim-discount" element={<DiscountPricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
