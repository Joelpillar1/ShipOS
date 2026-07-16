import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
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
const FailedPosts = React.lazy(() => import("./pages/FailedPosts"));
const Drafts = React.lazy(() => import("./pages/Drafts"));
const PostingQueue = React.lazy(() => import("./pages/PostingQueue"));
const Settings = React.lazy(() => import("./pages/Settings"));
const McpConfiguration = React.lazy(() => import("./pages/McpConfiguration"));
const McpDocs = React.lazy(() => import("./pages/McpDocs"));
const Team = React.lazy(() => import("./pages/Team"));
const Workspaces = React.lazy(() => import("./pages/Workspaces"));
const Help = React.lazy(() => import("./pages/Help"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const BillingSuccess = React.lazy(() => import("./pages/BillingSuccess"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const SlideshowStudio = React.lazy(() => import("./pages/SlideshowStudio"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const LinkedInPreviewer = React.lazy(() => import("./pages/LinkedInPreviewer"));
const XThreadFormatter = React.lazy(() => import("./pages/XThreadFormatter"));
const InstagramEngagementCalculator = React.lazy(() => import("./pages/InstagramEngagementCalculator"));
const SocialPostLimitChecker = React.lazy(() => import("./pages/SocialPostLimitChecker"));
const LinkedInTextFormatter = React.lazy(() => import("./pages/LinkedInTextFormatter"));
const TwitterTextFormatter = React.lazy(() => import("./pages/TwitterTextFormatter"));
const TikTokMoneyCalculator = React.lazy(() => import("./pages/TikTokMoneyCalculator"));
const YoutubeEngagementCalculator = React.lazy(() => import("./pages/YoutubeEngagementCalculator"));
const LinkedInEngagementCalculator = React.lazy(() => import("./pages/LinkedInEngagementCalculator"));
const XEngagementCalculator = React.lazy(() => import("./pages/XEngagementCalculator"));
const FacebookEngagementCalculator = React.lazy(() => import("./pages/FacebookEngagementCalculator"));
const InstagramCarouselSplitter = React.lazy(() => import("./pages/InstagramCarouselSplitter"));
const InstagramGridMaker = React.lazy(() => import("./pages/InstagramGridMaker"));
const FreeTools = React.lazy(() => import("./pages/FreeTools"));
const CompareBuffer = React.lazy(() => import("./pages/CompareBuffer"));
const CompareHootsuite = React.lazy(() => import("./pages/CompareHootsuite"));
const AiSocialMediaScheduler = React.lazy(() => import("./pages/AiSocialMediaScheduler"));
const LinkedinScheduler = React.lazy(() => import("./pages/LinkedinScheduler"));
const LinkedInPlatform = React.lazy(() => import("./pages/platforms/LinkedInPlatform"));
const InstagramPlatform = React.lazy(() => import("./pages/platforms/InstagramPlatform"));
const ThreadsPlatform = React.lazy(() => import("./pages/platforms/ThreadsPlatform"));
const XPlatform = React.lazy(() => import("./pages/platforms/XPlatform"));
const BlueskyPlatform = React.lazy(() => import("./pages/platforms/BlueskyPlatform"));
const TikTokPlatform = React.lazy(() => import("./pages/platforms/TikTokPlatform"));
const PinterestPlatform = React.lazy(() => import("./pages/platforms/PinterestPlatform"));
const FacebookPlatform = React.lazy(() => import("./pages/platforms/FacebookPlatform"));
const YouTubePlatform = React.lazy(() => import("./pages/platforms/YouTubePlatform"));
const SocialMediaCalendarTool = React.lazy(() => import("./pages/SocialMediaCalendarTool"));
const ComparisonMethodology = React.lazy(() => import("./pages/ComparisonMethodology"));
const CompareLater = React.lazy(() => import("./pages/CompareLater"));
const SocialMediaToolForAgencies = React.lazy(() => import("./pages/SocialMediaToolForAgencies"));
const SocialMediaToolForSaaSFounders = React.lazy(() => import("./pages/SocialMediaToolForSaaSFounders"));
const SocialMediaToolForPersonalBrands = React.lazy(() => import("./pages/SocialMediaToolForPersonalBrands"));
const Founder = React.lazy(() => import("./pages/Founder"));
const WhatIsShipOS = React.lazy(() => import("./pages/WhatIsShipOS"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPostDetail = React.lazy(() => import("./pages/BlogPostDetail"));


import { AppLayout } from "./components/AppLayout";
import { AdminLayout } from "./components/AdminLayout";
import BulkScheduleSkeleton from "./components/BulkScheduleSkeleton";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute, PublicOnlyRoute, AuthOnlyRoute, AdminRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { TeamProvider } from "./context/TeamContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WorkspaceSwitchScreen } from "./components/WorkspaceSwitchScreen";
import { DiscountBanner } from "./components/DiscountBanner";
import { CookieConsent } from "./components/CookieConsent";

// Persisted cache lifetime. gcTime must be >= maxAge so restored queries aren't
// garbage-collected from memory before the persisted copy would be used.
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data instantly when revisiting a page within the window,
      // so navigating between pages doesn't flash a skeleton + refetch every time.
      staleTime: 60_000, // 1 minute — after this, revalidate in the background
      gcTime: CACHE_MAX_AGE, // keep data cached long enough to be persisted/restored
      refetchOnWindowFocus: false, // don't refetch/flash when the tab regains focus
      retry: 1,
    },
  },
});

// Persist the React Query cache to localStorage so a reload or returning to the app
// paints real data instantly (then revalidates), instead of showing a fresh load.
// The key is `shipos_`-prefixed so AuthProvider's sign-out cleanup wipes it, preventing
// any cached data from leaking between accounts on a shared device.
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "shipos_rq_cache",
});

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
    <HelmetProvider>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        // Bump this string whenever cached data shapes change, to invalidate old caches.
        buster: "shipos-rq-v2",
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <WorkspaceProvider>
            {/* Workspace switch loading screen — always mounted so it reacts instantly */}
            <WorkspaceSwitchScreen />
            <TeamProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <Toaster />
                    <Sonner />
                    <ScrollToTop />
                    <DiscountBanner />
                    <CookieConsent />
                    <React.Suspense fallback={<FullPageLoading />}>
                      <Routes>
                      {/* ── Public pages ─────────────────────────────── */}
                      <Route path="/" element={<Index />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/docs/mcp" element={<McpDocs />} />
                      <Route path="/docs/mcp-social" element={<Navigate to="/docs/mcp" replace />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/linkedin-hook-previewer" element={<LinkedInPreviewer />} />
                      <Route path="/linkedin-preview" element={<Navigate to="/linkedin-hook-previewer" replace />} />
                      <Route path="/x-thread-formatter" element={<XThreadFormatter />} />
                      <Route path="/twitter-thread-formatter" element={<Navigate to="/x-thread-formatter" replace />} />
                      <Route path="/x-preview" element={<Navigate to="/x-thread-formatter" replace />} />
                      <Route path="/instagram-engagement-calculator" element={<InstagramEngagementCalculator />} />
                      <Route path="/instagram-calculator" element={<Navigate to="/instagram-engagement-calculator" replace />} />
                      <Route path="/ig-calculator" element={<Navigate to="/instagram-engagement-calculator" replace />} />
                      <Route path="/social-post-limit-checker" element={<SocialPostLimitChecker />} />
                      <Route path="/character-limit-checker" element={<Navigate to="/social-post-limit-checker" replace />} />
                      <Route path="/post-limit" element={<Navigate to="/social-post-limit-checker" replace />} />
                      <Route path="/linkedin-text-formatter" element={<LinkedInTextFormatter />} />
                      <Route path="/linkedin-formatter" element={<Navigate to="/linkedin-text-formatter" replace />} />
                      <Route path="/linkedin-bold" element={<Navigate to="/linkedin-text-formatter" replace />} />
                      <Route path="/twitter-text-formatter" element={<TwitterTextFormatter />} />
                      <Route path="/twitter-formatter" element={<Navigate to="/twitter-text-formatter" replace />} />
                      <Route path="/twitter-bold" element={<Navigate to="/twitter-text-formatter" replace />} />
                      <Route path="/x-text-formatter" element={<Navigate to="/twitter-text-formatter" replace />} />
                      <Route path="/x-formatter" element={<Navigate to="/twitter-text-formatter" replace />} />
                      <Route path="/tiktok-money-calculator" element={<TikTokMoneyCalculator />} />
                      <Route path="/tiktok-calculator" element={<Navigate to="/tiktok-money-calculator" replace />} />
                      <Route path="/tiktok-money" element={<Navigate to="/tiktok-money-calculator" replace />} />
                      <Route path="/youtube-engagement-calculator" element={<YoutubeEngagementCalculator />} />
                      <Route path="/youtube-calculator" element={<Navigate to="/youtube-engagement-calculator" replace />} />
                      <Route path="/youtube-engagement" element={<Navigate to="/youtube-engagement-calculator" replace />} />
                      <Route path="/linkedin-engagement-calculator" element={<LinkedInEngagementCalculator />} />
                      <Route path="/linkedin-calculator" element={<Navigate to="/linkedin-engagement-calculator" replace />} />
                      <Route path="/linkedin-engagement" element={<Navigate to="/linkedin-engagement-calculator" replace />} />
                      <Route path="/x-engagement-calculator" element={<XEngagementCalculator />} />
                      <Route path="/x-calculator" element={<Navigate to="/x-engagement-calculator" replace />} />
                      <Route path="/twitter-engagement-calculator" element={<Navigate to="/x-engagement-calculator" replace />} />
                      <Route path="/twitter-calculator" element={<Navigate to="/x-engagement-calculator" replace />} />
                      <Route path="/x-engagement" element={<Navigate to="/x-engagement-calculator" replace />} />
                      <Route path="/facebook-engagement-calculator" element={<FacebookEngagementCalculator />} />
                      <Route path="/facebook-calculator" element={<Navigate to="/facebook-engagement-calculator" replace />} />
                      <Route path="/fb-calculator" element={<Navigate to="/facebook-engagement-calculator" replace />} />
                      <Route path="/fb-engagement" element={<Navigate to="/facebook-engagement-calculator" replace />} />
                      <Route path="/instagram-carousel-splitter" element={<InstagramCarouselSplitter />} />
                      <Route path="/instagram-splitter" element={<Navigate to="/instagram-carousel-splitter" replace />} />
                      <Route path="/carousel-splitter" element={<Navigate to="/instagram-carousel-splitter" replace />} />
                      <Route path="/ig-splitter" element={<Navigate to="/instagram-carousel-splitter" replace />} />
                      <Route path="/instagram-grid-maker" element={<InstagramGridMaker />} />
                      <Route path="/instagram-grid" element={<Navigate to="/instagram-grid-maker" replace />} />
                      <Route path="/grid-maker" element={<Navigate to="/instagram-grid-maker" replace />} />
                      <Route path="/ig-grid" element={<Navigate to="/instagram-grid-maker" replace />} />
                      <Route path="/discount" element={<Navigate to="/" replace />} />
                      <Route path="/claim-discount" element={<Navigate to="/" replace />} />
                      <Route path="/free-tools" element={<FreeTools />} />
                      <Route path="/tools" element={<Navigate to="/free-tools" replace />} />
                      <Route path="/compare/buffer" element={<CompareBuffer />} />
                      <Route path="/alternative-to-buffer" element={<Navigate to="/compare/buffer" replace />} />
                      <Route path="/shipos-vs-buffer" element={<Navigate to="/compare/buffer" replace />} />
                      <Route path="/compare/hootsuite" element={<CompareHootsuite />} />
                      <Route path="/alternative-to-hootsuite" element={<Navigate to="/compare/hootsuite" replace />} />
                      <Route path="/shipos-vs-hootsuite" element={<Navigate to="/compare/hootsuite" replace />} />
                      <Route path="/compare/later" element={<CompareLater />} />
                      <Route path="/shipos-vs-later" element={<Navigate to="/compare/later" replace />} />
                      <Route path="/alternative-to-later" element={<Navigate to="/compare/later" replace />} />
                      <Route path="/ai-social-media-scheduler" element={<AiSocialMediaScheduler />} />
                      <Route path="/social-media-scheduler" element={<Navigate to="/ai-social-media-scheduler" replace />} />
                      <Route path="/ai-scheduler" element={<Navigate to="/ai-social-media-scheduler" replace />} />
                      <Route path="/linkedin" element={<LinkedInPlatform />} />
                      <Route path="/linkedin-scheduler" element={<LinkedinScheduler />} />
                      <Route path="/linkedin-post-scheduler" element={<Navigate to="/linkedin-scheduler" replace />} />
                      <Route path="/linkedin-marketing" element={<Navigate to="/linkedin" replace />} />
                      <Route path="/instagram-post-scheduler" element={<InstagramPlatform />} />
                      <Route path="/instagram" element={<Navigate to="/instagram-post-scheduler" replace />} />
                      <Route path="/instagram-scheduler" element={<Navigate to="/instagram-post-scheduler" replace />} />
                      <Route path="/instagram-marketing" element={<Navigate to="/instagram-post-scheduler" replace />} />
                      <Route path="/schedule-ig-posts" element={<Navigate to="/instagram-post-scheduler" replace />} />
                      <Route path="/threads-post-scheduler" element={<ThreadsPlatform />} />
                      <Route path="/threads" element={<Navigate to="/threads-post-scheduler" replace />} />
                      <Route path="/threads-scheduler" element={<Navigate to="/threads-post-scheduler" replace />} />
                      <Route path="/threads-marketing" element={<Navigate to="/threads-post-scheduler" replace />} />
                      <Route path="/x-post-scheduler" element={<XPlatform />} />
                      <Route path="/x" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/twitter" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/x-scheduler" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/twitter-scheduler" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/twitter-post-scheduler" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/schedule-tweets" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/schedule-twitter-posts" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/schedule-your-tweets" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/x-marketing" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/twitter-marketing" element={<Navigate to="/x-post-scheduler" replace />} />
                      <Route path="/bluesky-post-scheduler" element={<BlueskyPlatform />} />
                      <Route path="/bluesky" element={<Navigate to="/bluesky-post-scheduler" replace />} />
                      <Route path="/bluesky-scheduler" element={<Navigate to="/bluesky-post-scheduler" replace />} />
                      <Route path="/bluesky-marketing" element={<Navigate to="/bluesky-post-scheduler" replace />} />
                      <Route path="/tiktok-post-scheduler" element={<TikTokPlatform />} />
                      <Route path="/tiktok" element={<Navigate to="/tiktok-post-scheduler" replace />} />
                      <Route path="/tiktok-scheduler" element={<Navigate to="/tiktok-post-scheduler" replace />} />
                      <Route path="/tiktok-marketing" element={<Navigate to="/tiktok-post-scheduler" replace />} />
                      <Route path="/schedule-tiktok-posts" element={<Navigate to="/tiktok-post-scheduler" replace />} />
                      <Route path="/pinterest-pin-scheduler" element={<PinterestPlatform />} />
                      <Route path="/pinterest" element={<Navigate to="/pinterest-pin-scheduler" replace />} />
                      <Route path="/pinterest-scheduler" element={<Navigate to="/pinterest-pin-scheduler" replace />} />
                      <Route path="/pinterest-marketing" element={<Navigate to="/pinterest-pin-scheduler" replace />} />
                      <Route path="/schedule-pinterest-pins" element={<Navigate to="/pinterest-pin-scheduler" replace />} />
                      <Route path="/facebook-post-scheduler" element={<FacebookPlatform />} />
                      <Route path="/facebook" element={<Navigate to="/facebook-post-scheduler" replace />} />
                      <Route path="/facebook-scheduler" element={<Navigate to="/facebook-post-scheduler" replace />} />
                      <Route path="/facebook-marketing" element={<Navigate to="/facebook-post-scheduler" replace />} />
                      <Route path="/schedule-facebook-posts" element={<Navigate to="/facebook-post-scheduler" replace />} />
                      <Route path="/fb-scheduler" element={<Navigate to="/facebook-post-scheduler" replace />} />
                      <Route path="/youtube-video-scheduler" element={<YouTubePlatform />} />
                      <Route path="/youtube" element={<Navigate to="/youtube-video-scheduler" replace />} />
                      <Route path="/youtube-scheduler" element={<Navigate to="/youtube-video-scheduler" replace />} />
                      <Route path="/youtube-marketing" element={<Navigate to="/youtube-video-scheduler" replace />} />
                      <Route path="/schedule-youtube-videos" element={<Navigate to="/youtube-video-scheduler" replace />} />
                      <Route path="/social-media-calendar-tool" element={<SocialMediaCalendarTool />} />
                      <Route path="/social-media-calendar" element={<Navigate to="/social-media-calendar-tool" replace />} />
                      <Route path="/social-media-tool-for-agencies" element={<SocialMediaToolForAgencies />} />
                      <Route path="/social-media-management-for-agencies" element={<Navigate to="/social-media-tool-for-agencies" replace />} />
                      <Route path="/social-media-tool-for-saas-founders" element={<SocialMediaToolForSaaSFounders />} />
                      <Route path="/social-media-tool-for-saas" element={<Navigate to="/social-media-tool-for-saas-founders" replace />} />
                      <Route path="/social-media-for-saas-founders" element={<Navigate to="/social-media-tool-for-saas-founders" replace />} />
                      <Route path="/founder" element={<Founder />} />
                      <Route path="/for-founders" element={<Navigate to="/founder" replace />} />
                      <Route path="/social-media-tool-for-personal-brands" element={<SocialMediaToolForPersonalBrands />} />
                      <Route path="/social-media-tool-for-creators" element={<Navigate to="/social-media-tool-for-personal-brands" replace />} />
                      <Route path="/personal-branding-tool" element={<Navigate to="/social-media-tool-for-personal-brands" replace />} />
                      <Route path="/shipos-vs-alternatives-methodology" element={<ComparisonMethodology />} />
                      <Route path="/comparison-methodology" element={<Navigate to="/shipos-vs-alternatives-methodology" replace />} />
                      <Route path="/what-is-shipos" element={<WhatIsShipOS />} />
                      <Route path="/about" element={<Navigate to="/what-is-shipos" replace />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<BlogPostDetail />} />
                      <Route path="/playbooks" element={<Navigate to="/blog" replace />} />
                      <Route path="/articles" element={<Navigate to="/blog" replace />} />


                      {/* ── Auth pages (redirect to dashboard if already logged in) ── */}
                      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                      <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
                      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/admin/login" element={<AdminLogin />} />

                      {/* ── Onboarding (auth required, but onboarding-completion check skipped) ── */}
                      <Route path="/onboarding" element={<AuthOnlyRoute><Onboarding /></AuthOnlyRoute>} />
                      <Route path="/setup-loading" element={<SetupLoading />} />
                      <Route path="/billing/success" element={<AuthOnlyRoute><BillingSuccess /></AuthOnlyRoute>} />

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
                          <AppLayout fallback={<BulkScheduleSkeleton />}><BulkSchedule /></AppLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/content-studio" element={
                        <ProtectedRoute>
                          <AppLayout><ContentStudio /></AppLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/slideshow-studio" element={
                        <ProtectedRoute>
                          <AppLayout><SlideshowStudio /></AppLayout>
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
                      <Route path="/failed-posts" element={
                        <ProtectedRoute>
                          <AppLayout><FailedPosts /></AppLayout>
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
                      <Route path="/configure/api-keys" element={
                        <ProtectedRoute>
                          <AppLayout><McpConfiguration /></AppLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/configure/mcp" element={
                        <ProtectedRoute>
                          <Navigate to="/configure/api-keys" replace />
                        </ProtectedRoute>
                      } />
                      <Route path="/team" element={
                        <Navigate to="/settings" replace />
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
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminLayout><AdminDashboard /></AdminLayout>
                        </AdminRoute>
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
    </PersistQueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
