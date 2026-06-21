import { useState, useEffect, useRef } from"react";
import { motion } from"framer-motion";
import { Button } from"@/components/ui/button";
import { Card, CardContent } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Switch } from"@/components/ui/switch";
import { useNavigate } from"react-router-dom";
import { toast } from"sonner";
import { cn } from"@/lib/utils";
import { Footer } from"@/components/Footer";
import { SEO } from"@/components/SEO";
import {
 organizationSchema,
 websiteSchema,
 softwareApplicationSchema,
 faqSchema,
} from"@/lib/seo";
import { useTheme } from"next-themes";
import { ThemeToggle } from"../components/ThemeToggle";
import { Header } from"@/components/Header";
import { AIContentStudioMockup } from"@/components/AIContentStudioMockup";
import { CalendarMockup } from"@/components/CalendarMockup";
import { BulkUploadMockup } from"@/components/BulkUploadMockup";
import { AnalyticsDashboardMockup } from"@/components/AnalyticsDashboardMockup";
import { SlideshowStudioMockup } from"@/components/SlideshowStudioMockup";
import { SocialOrbitAnimation } from"@/components/SocialOrbitAnimation";
import { TestimonialsMarquee } from"@/components/TestimonialsMarquee";
import { useAuth } from"@/hooks/useAuth";
import { getUserProfile } from"@/lib/postStorage";
import { PLANS } from"@/lib/plans";
import {
 Check,
 Star,
 ArrowRight,
 Play,
 Users,
 Clock,
 Calendar,
 Zap,
 BarChart3,
 Bot,
 Repeat,
 FileText,
 Upload,
 MessageSquare,
 TrendingUp,
 Link,
 Eye,
 Shuffle,
 Archive,
 Sparkles,
 Crown,
 Twitter,
 Linkedin,
 Instagram,
 Plus,
 Trash2,
 Send,
 CheckCircle2,
 ChevronRight,
 ChevronDown,
 HelpCircle,
 MessageCircle,
 LayoutGrid,
 ListTodo,
 CalendarDays,
 Images,
 Menu,
 X,
} from"lucide-react";

// Types for interactive widgets
type Platform ="x" |"linkedin" |"instagram";
type AIPromptType ="hook" |"thread" |"cta";

const FadeIn = ({ children, delay = 0, direction ="up", className ="" }: { children: React.ReactNode, delay?: number, direction?:"up" |"down" |"left" |"right" |"none", className?: string }) => {
 const directions = {
 up: { y: 40, x: 0 },
 down: { y: -40, x: 0 },
 left: { x: 40, y: 0 },
 right: { x: -40, y: 0 },
 none: { x: 0, y: 0 }
 };
 return (
 <motion.div
 initial={{ opacity: 0, ...directions[direction] }}
 whileInView={{ opacity: 1, x: 0, y: 0 }}
 viewport={{ once: true, margin:"-50px" }}
 transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
 className={className}
 >
 {children}
 </motion.div>
 );
};

const SectionBadge = ({ label, text }: { label: string; text: string }) => (
 <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6">
 <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner">
 {label}
 </div>
 <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide">
 {text}
 </span>
 </div>
);

const Index = () => {
 const { resolvedTheme } = useTheme();
 const isDark = resolvedTheme ==="dark";
 const navigate = useNavigate();
 const [isVisible, setIsVisible] = useState(false);
 const [isAnnual, setIsAnnual] = useState(false);
 const [activeFaq, setActiveFaq] = useState<number | null>(null);


 // 1. Hero Section - Interactive Composer State
 const [heroPlatform, setHeroPlatform] = useState<Platform>("x");
 const [composerText, setComposerText] = useState<string>(
"Just shipped our cross-platform content engine on ShipOS! Draft once, customize for each platform, and publish across all socials with single-click precision. Time is money, let's ship fast. 🚀"
 );
 const [enabledPlatforms, setEnabledPlatforms] = useState<Record<Platform, boolean>>({
 x: true,
 linkedin: true,
 instagram: false,
 });
 const [isSubmitting, setIsSubmitting] = useState(false);

 // 2. Bento Grid - Interactive Thread Builder State
 const [threadNodes, setThreadNodes] = useState<string[]>([
"1/3: Stop wasting hours writing social posts manually. Here's how we built ShipOS to auto-format and optimize your content sequence...",
"2/3: By integrating smart scheduling, content recycling, and deep growth analytics, creators save an average of 10+ hours per week.",
 ]);
 const [newThreadText, setNewThreadText] = useState("");

 // 3. Bento Grid - Interactive AI Writer State
 const [aiPrompt, setAiPrompt] = useState<AIPromptType>("hook");
 const [aiOutputText, setAiOutputText] = useState("");
 const [isTyping, setIsTyping] = useState(false);
 const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

 // 4. Bento Grid - Interactive Calendar State
 const [selectedDay, setSelectedDay] = useState<number>(19);
 const [calendarPosts, setCalendarPosts] = useState<Record<number, { time: string; platform: Platform; text: string }[]>>({
 17: [
 { time:"9:00 AM", platform:"x", text:"Product launch countdown begins!" },
 ],
 19: [
 { time:"12:30 PM", platform:"x", text:"Deep dive into cross-platform content strategy." },
 { time:"6:15 PM", platform:"linkedin", text:"Why visual schedulers double creator conversion rate." },
 ],
 22: [
 { time:"8:00 AM", platform:"instagram", text:"ShipOS Office Hours Live Session Announcement." },
 ],
 24: [
 { time:"4:00 PM", platform:"x", text:"Evergreen content series: 5 tips to scale SaaS." },
 ],
 });
 const [newSlotTime, setNewSlotTime] = useState("10:00 AM");
 const [newSlotText, setNewSlotText] = useState("");

 // Interactive state cleaned up for new Analytics Dashboard

 useEffect(() => {
 setIsVisible(true);
 // Initial AI Writer animation trigger
 triggerAITyping("hook");

 // Smooth scroll to hash if present on mount
 if (window.location.hash) {
 const id = window.location.hash.substring(1);
 setTimeout(() => {
 const element = document.getElementById(id);
 if (element) {
 const top = element.getBoundingClientRect().top + window.scrollY - 80;
 window.scrollTo({ top, behavior:"smooth" });
 }
 }, 150);
 }

 return () => {
 if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
 };
 }, []);

 // Handler for Hero"Publish" action
 const handlePublishAll = () => {
 const activeDestinations = Object.entries(enabledPlatforms)
 .filter(([_, enabled]) => enabled)
 .map(([platform]) => platform.toUpperCase());

 if (activeDestinations.length === 0) {
 toast.error("Please select at least one social destination to publish!");
 return;
 }

 setIsSubmitting(true);
 toast.loading(`Deploying content bundle to ${activeDestinations.join(",")}...`, {
 id:"deploy-toast",
 });

 setTimeout(() => {
 toast.success(`Published! Content deployed live to ${activeDestinations.join(",")}!`, {
 id:"deploy-toast",
 description:"Analytics will start updating immediately.",
 });
 setIsSubmitting(false);
 }, 1800);
 };

 // Handler for thread node additions
 const handleAddThreadNode = () => {
 if (!newThreadText.trim()) return;
 const index = threadNodes.length + 1;
 setThreadNodes([...threadNodes, `${index}/3: ${newThreadText}`]);
 setNewThreadText("");
 toast.success("Thread node appended successfully.");
 };

 const handleRemoveThreadNode = (index: number) => {
 const updated = threadNodes.filter((_, i) => i !== index);
 // Re-index remaining nodes
 const reindexed = updated.map((node, i) => {
 const content = node.substring(node.indexOf(":") + 2);
 return `${i + 1}/3: ${content}`;
 });
 setThreadNodes(reindexed);
 toast.info("Thread node removed.");
 };

 // AI Prompt typing simulation logic
 const triggerAITyping = (type: AIPromptType) => {
 setAiPrompt(type);
 setIsTyping(true);
 if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

 const prompts: Record<AIPromptType, string> = {
 hook:"💡 Hook: 90% of creators fail because they compile posts manually. Here's our exact 3-step stack that saves 10 hours a week...",
 thread:"🧵 Thread Outline:\n1/ Deep problem analysis\n2/ High-fidelity solution workflow\n3/ Actionable case study showing +240% ROI\n4/ Dynamic evergreen CTA.",
 cta:"🔥 Call to Action: Ready to scale your brand on autopilot? Use ShipOS's multi-platform composer free for 7 days. Link in bio! 👇",
 };

 const targetText = prompts[type];
 let currentIndex = 0;
 setAiOutputText("");

 const typeCharacter = () => {
 if (currentIndex < targetText.length) {
 setAiOutputText(targetText.substring(0, currentIndex + 1));
 currentIndex++;
 typingTimerRef.current = setTimeout(typeCharacter, 18);
 } else {
 setIsTyping(false);
 }
 };
 typeCharacter();
 };

 // Calendar slot scheduler logic
 const handleScheduleSlot = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newSlotText.trim()) return;

 const newPost = {
 time: newSlotTime,
 platform:"x" as Platform,
 text: newSlotText,
 };

 setCalendarPosts((prev) => ({
 ...prev,
 [selectedDay]: [...(prev[selectedDay] || []), newPost],
 }));

 setNewSlotText("");
 toast.success(`Post successfully scheduled for May ${selectedDay} at ${newSlotTime}!`);
 };

 // Pricing Helpers
 const pricingPlans = PLANS.map(plan => {
 let color ="border-border hover:border-foreground/20 hover:shadow-md";
 let accent ="bg-muted text-muted-foreground";
 
 if (plan.name ==="Creator") {
 color ="border-primary/50 shadow-lg hover:shadow-xl scale-105";
 accent ="bg-primary text-white";
 } else if (plan.name ==="Pro") {
 color ="border-border hover:border-foreground/20 hover:shadow-md";
 accent ="bg-foreground text-background";
 }
 
 return {
 ...plan,
 limitations: [],
 color,
 accent,
 };
 });

 const getPriceText = (plan: typeof pricingPlans[0]) => {
 const cost = isAnnual ? plan.price.annual : plan.price.monthly;
 const period = isAnnual ?"/year" :"/month";
 if (cost === 0) return"Free Forever";
 return `$${cost}${period}`;
 };

 const faqs = [
 {
 question:"Which social media platforms does ShipOS support?",
 answer:"ShipOS supports all major networks including X (Twitter), LinkedIn, Instagram, Threads, Bluesky, TikTok, Pinterest, Facebook, and YouTube. You can connect multiple profiles and publish or schedule text, images, and video content directly from one place.",
 },
 {
 question:"How does the cross-platform composer handle different network limits?",
 answer:"Our smart composer gives you a unified workspace while letting you customize tabs for each platform. We automatically track character limits (e.g., 280 for X, 3000 for LinkedIn), image aspect ratios, and format rules.",
 },
 {
 question:"How does the visual calendar drag-and-drop scheduling work?",
 answer:"The interactive visual calendar displays all your scheduled posts across all platforms. If you need to rearrange your queue, simply drag a post card and drop it onto another day. ShipOS updates the scheduled date in the database automatically.",
 },
 {
 question:"What is Bulk Scheduling and how do I use it?",
 answer:"Bulk Scheduling allows you to queue up to 10 posts on Starter, 25 posts on Creator, and 50 posts on Pro at once. You upload a CSV template with columns for your content, media URLs, scheduled date/time, and platform channels. Our system parses the file in real-time, highlights any errors, and lets you import and schedule everything in bulk.",
 },
 {
 question:"What are AI Credits and how does the AI Content Studio help me?",
 answer:"The AI Content Studio assists you in generating hooks, formatting posts, or writing engaging calls-to-action (CTAs). A credit is consumed when you run an AI generation prompt. Starter plans include 100 credits/mo, Creator plans include 400 credits/mo, and Pro plans offer unlimited credits.",
 },
 {
 question:"Is it safe to connect my official brand accounts to ShipOS?",
 answer:"Yes, completely safe. ShipOS connects to your profiles using secure, official OAuth 2.0 API integrations. We never see or store your social passwords, and all social tokens are securely encrypted in transit and at rest. You can disconnect accounts at any time.",
 },
 {
 question:"Is there a free trial, and can I cancel or change plans?",
 answer:"Yes! We offer a 7-day fully functional free trial on all paid plans. You can cancel, upgrade, or downgrade your plan at any time directly from the settings billing dashboard with a single click.",
 },
 ];

 // Social badges for the hero center-stack
 const socialBadges = [
 {
 name:"LinkedIn",
 bg:"bg-[#0077B5]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 ),
 },
 {
 name:"Instagram",
 bg:"bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
 </svg>
 ),
 },
 {
 name:"Threads",
 bg:"bg-[#101010]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16">
 <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
 </svg>
 ),
 },
 {
 name:"Twitter",
 bg:"bg-[#101010]",
 icon: (
 <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
 </svg>
 ),
 },
 {
 name:"Bluesky",
 bg:"bg-[#0285FF]",
 icon: (
 <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 320 286">
 <path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/>
 </svg>
 ),
 },
 {
 name:"TikTok",
 bg:"bg-[#010101]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
 </svg>
 ),
 },
 {
 name:"Pinterest",
 bg:"bg-[#BD081C]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" />
 </svg>
 ),
 },
 {
 name:"Facebook",
 bg:"bg-[#1877F2]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
 </svg>
 ),
 },
 {
 name:"YouTube",
 bg:"bg-[#FF0000]",
 icon: (
 <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
 <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
 </svg>
 ),
 },
 ];

  // Helper to order and render social icons for the bottom CTA to match the design
  const ctaSocialOrder = ["LinkedIn", "Instagram", "Facebook", "Twitter", "YouTube", "Threads", "Pinterest", "Bluesky", "TikTok"];

  const renderCTASocialIcon = (name: string, icon: React.ReactNode, bg: string) => {
    return (
      <div
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-none flex items-center justify-center shadow-sm border border-black/5 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-300",
          bg
        )}
      >
        {icon}
      </div>
    );
  };

 return (
 <div 
 className="min-h-screen text-foreground relative overflow-hidden font-sans animate-fade-in bg-background"
 style={{
 backgroundColor: isDark ?"transparent" :"#FAF7F5",
 }}
 >
 <SEO
 title="ShipOS — Social Media Scheduling & Management Tool for Everyone"
 description="Plan, write, schedule, and publish across X, LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest & YouTube from one workspace. Content Studio, Slideshow Studio, bulk CSV scheduling, a visual calendar, and analytics. Start a 7-day free trial."
 path="/"
 type="website"
 jsonLd={[
 organizationSchema(),
 websiteSchema(),
 softwareApplicationSchema(),
 faqSchema(faqs),
 ]}
 />
 {/* Background Dot Pattern & Ambient Gradients */}
 <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

 {/* Styled Grid Line Border Accents */}
 <div className="absolute top-20 left-0 right-0 h-[1px] bg-border/20 pointer-events-none" />
 <div className="absolute top-0 bottom-0 left-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />
 <div className="absolute top-0 bottom-0 right-[8%] w-[1px] bg-border/20 pointer-events-none hidden lg:block" />

 {/* Top Navbar */}
 <Header />

 {/* Brand-Aligned Hero Section */}
 <section className="pt-44 pb-20 px-4 md:px-8 lg:px-12 relative z-10 max-w-7xl mx-auto text-center">
    <FadeIn delay={0.1} className="max-w-4xl mx-auto space-y-6">
      {/* Centered Social Badges Row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-8 select-none">
        {socialBadges.map((badge, idx) => (
          <div
            key={idx}
            className={cn(
              "w-7 h-7 sm:w-10 sm:h-10 rounded-none flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-300 border border-black/5",
              badge.bg
            )}
            title={badge.name}
          >
            {badge.icon}
          </div>
        ))}
      </div>

      {/* Headline Typography */}
      <h1 className="text-[#1A1A1A] dark:text-neutral-100 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto select-none">
        One{" "}
        <img 
          src="/logo-icon.png" 
          alt="ShipOS Icon" 
          className="inline-block align-middle h-12 sm:h-16 md:h-20 w-auto object-contain transform -rotate-12 mx-2 select-none" 
        />{" "}
        to run your <br className="hidden sm:block" />
        entire social presence.
      </h1>

      {/* Subheadline Text */}
      <p className="text-gray-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed pt-2">
        Write once, schedule everywhere, and analyze growth. Drop a topic, let AI create or enhance <br className="hidden md:block" />
        your content, then publish to all your social platforms in one click.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <Button
          onClick={() => navigate("/signup")}
          className="w-full sm:w-auto px-10 h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold text-base tracking-wide transition-all duration-300 hover:scale-[1.03] shadow-[0_6px_20px_rgba(215,90,52,0.25)] border-none inline-flex items-center justify-center gap-2"
        >
          Try it for $0 (7-days) <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </FadeIn>
  </section>

 {/* Demo Video Box */}
 <section className="relative z-20 pb-16 md:pb-24 px-4 md:px-8 max-w-4xl mx-auto">
 <FadeIn delay={0.2}>
 <div className="relative w-full aspect-video bg-[#fbf4f2] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-none">
 {/* Top Bar for Window effect */}
 <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center px-3 gap-2 border-b-2 border-black z-20">
 <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
 <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
 <div className="ml-2 text-white/90 text-[10px] font-bold tracking-widest">ShipOS_Platform_Demo.mp4</div>
 </div>
 
 {/* Background pattern */}
 <div className="absolute inset-0 mt-8 bg-[#101010] flex items-center justify-center">
 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
 
 {/* Play Button */}
 <div className="relative z-10 w-20 h-20 bg-[#d75a34] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 </div>
 </div>
 </FadeIn>
 </section>



 {/* Flow Animation Section */}
 <section className="relative z-20 py-20 px-4 md:px-8 max-w-[1400px] mx-auto border-t border-border/20">
 <FadeIn>
 <div className="text-center mb-10 max-w-2xl mx-auto">
 <SectionBadge label="Workflow" text="How it all comes together" />
 <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The ShipOS Funnel</h2>
 <p className="text-muted-foreground text-lg">Integrate everything. AI structures the noise into high-converting posts instantly.</p>
 </div>
 <SocialOrbitAnimation />
 </FadeIn>
 </section>

 {/* Features Section */}
 <section id="features" className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto">
 <FadeIn>
 <div className="bg-[#fdfbf9] dark:bg-[#1f1d1b] rounded-none border border-[#f0dfd8] dark:border-neutral-800/80 p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
 
 {/* Header Row */}
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
 <div className="flex flex-col items-start">
 <SectionBadge label="Features" text="Powerful platform capabilities" />
 <h2 className="text-4xl md:text-5xl font-medium text-[#1c2024] dark:text-foreground tracking-tight max-w-xl leading-tight mt-2">
 Everything you need.<br/>Nothing you don't.
 </h2>
 </div>
 <div className="flex flex-col items-start lg:items-end gap-5 max-w-sm">
 <p className="text-[#4b5563] dark:text-muted-foreground text-sm leading-relaxed text-left lg:text-right font-medium">
 Unlock the power of unified social velocity, campaign management, and deep growth analytics with ShipOS's comprehensive solution.
 </p>
 <Button onClick={() => navigate("/signup")} className="rounded-none bg-transparent border border-[#d75a34] text-[#d75a34] hover:bg-[#d75a34] hover:text-white transition-all font-semibold px-6 py-2 h-auto flex items-center gap-2 group">
 Try it for $0 (7-days)
 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </div>
 </div>

 {/* Asymmetrical Grid for Features 1-4 */}
 <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
 
 {/* Feature 1 */}
 <div className="md:col-span-5 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative">
 {/* Mockup: Cross-platform post */}
 <div className="w-full max-w-[280px] flex flex-col items-center relative overflow-hidden">
 <div className="h-8 flex items-center justify-center mb-2 z-10 relative">
 <img src={isDark ?"/logo-white.png" :"/logo-black.png"} alt="ShipOS Logo" className="h-7 w-auto" />
 </div>
 {/* Branching electric-current paths */}
 <svg viewBox="0 0 280 55" className="w-full max-w-[280px] mb-2" style={{ overflow: 'visible' }}>
 <defs>
 {/* Glow filter for electric current */}
 <filter id="electricGlow" x="-50%" y="-50%" width="200%" height="200%">
 <feGaussianBlur stdDeviation="3" result="blur" />
 <feMerge>
 <feMergeNode in="blur" />
 <feMergeNode in="SourceGraphic" />
 </feMerge>
 </filter>
 <filter id="electricGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
 <feGaussianBlur stdDeviation="5" result="blur" />
 <feMerge>
 <feMergeNode in="blur" />
 <feMergeNode in="blur" />
 <feMergeNode in="SourceGraphic" />
 </feMerge>
 </filter>
 {/* Gradient for path lines */}
 <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#d75a34" stopOpacity="0.6" />
 <stop offset="100%" stopColor="#d75a34" stopOpacity="0.2" />
 </linearGradient>
 </defs>

 {/* Trunk line from center */}
 <line x1="140" y1="0" x2="140" y2="12" stroke="url(#pathGrad)" strokeWidth="2" />

 {/* Left branch path */}
 <path id="leftBranch" d="M140,12 C140,28 90,30 30,50" fill="none" stroke="url(#pathGrad)" strokeWidth="1.5" />
 {/* Right branch path */}
 <path id="rightBranch" d="M140,12 C140,28 190,30 250,50" fill="none" stroke="url(#pathGrad)" strokeWidth="1.5" />

 {/* Electric current dots - Left branch */}
 <circle r="3" fill="#d75a34" opacity="0.9" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#leftBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="1;0.5;1;0.7;1" dur="0.3s" repeatCount="indefinite" />
 <animate attributeName="r" values="2.5;4;2.5" dur="0.4s" repeatCount="indefinite" />
 </circle>
 <circle r="2" fill="#ff8c5a" opacity="0.7" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.6s" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#leftBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="0.8;0.3;0.8;0.5;0.8" dur="0.25s" repeatCount="indefinite" />
 </circle>
 <circle r="1.5" fill="#ffb088" opacity="0.6" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.2s" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#leftBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.35s" repeatCount="indefinite" />
 </circle>

 {/* Electric current dots - Right branch */}
 <circle r="3" fill="#d75a34" opacity="0.9" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.2s" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#rightBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="1;0.5;1;0.7;1" dur="0.3s" repeatCount="indefinite" />
 <animate attributeName="r" values="2.5;4;2.5" dur="0.4s" repeatCount="indefinite" />
 </circle>
 <circle r="2" fill="#ff8c5a" opacity="0.7" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.8s" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#rightBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="0.8;0.3;0.8;0.5;0.8" dur="0.25s" repeatCount="indefinite" />
 </circle>
 <circle r="1.5" fill="#ffb088" opacity="0.6" filter="url(#electricGlow)">
 <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.4s" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
 <mpath href="#rightBranch" />
 </animateMotion>
 <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.35s" repeatCount="indefinite" />
 </circle>

 {/* Small arrowheads at each branch end */}
 <polygon points="25,52 30,42 35,52" fill="#d75a34" opacity="0.5" />
 <polygon points="245,52 250,42 255,52" fill="#d75a34" opacity="0.5" />
 </svg>
 
 {/* Infinite Scrolling Track */}
 <div className="w-full overflow-hidden relative py-2 flex">
 <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#fcf5f3] dark:from-[#191715] to-transparent z-10 pointer-events-none"></div>
 <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fcf5f3] dark:from-[#191715] to-transparent z-10 pointer-events-none"></div>
 
 <motion.div 
 className="flex gap-4 items-center pl-4 whitespace-nowrap"
 animate={{ x: ["0%","-50%"] }}
 transition={{ duration: 10, repeat: Infinity, ease:"linear" }}
 >
 {/* First Set */}
 <div className="w-10 h-10 bg-[#0077B5] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></div>
 <div className="w-10 h-10 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
 <div className="w-10 h-10 bg-[#101010] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg></div>
 <div className="w-10 h-10 bg-[#0285FF] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" /></svg></div>
 <div className="w-10 h-10 bg-[#010101] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></div>
 <div className="w-10 h-10 bg-[#BD081C] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" /></svg></div>
 <div className="w-10 h-10 bg-[#1877F2] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></div>

 {/* Duplicated for smooth infinite scrolling */}
 <div className="w-10 h-10 bg-[#0077B5] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></div>
 <div className="w-10 h-10 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
 <div className="w-10 h-10 bg-[#101010] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg></div>
 <div className="w-10 h-10 bg-[#0285FF] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" /></svg></div>
 <div className="w-10 h-10 bg-[#010101] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></div>
 <div className="w-10 h-10 bg-[#BD081C] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" /></svg></div>
 <div className="w-10 h-10 bg-[#1877F2] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></div>
 <div className="w-10 h-10 bg-[#FF0000] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></div>
 </motion.div>
 </div>
 </div>
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <LayoutGrid className="w-5 h-5 text-[#d75a34]" /> Write once. Publish everywhere.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 One post. Every platform. One click. ShipOS automatically formats your content to match each platform's rules - character limits, image ratios, spacing - so it looks native everywhere it lands.
 </p>
 </div>
 </div>

 {/* Feature 2 */}
 <div className="md:col-span-7 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative">
 {/* Interactive Bulk Upload Workspace Mockup matching actual app UI */}
 <BulkUploadMockup />
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <ListTodo className="w-5 h-5 text-[#d75a34]" /> Bulk scheduling that actually saves time.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 Plan your entire week or month in one sitting. Upload, organize, and schedule hundreds of posts at once across all your platforms. Set it, confirm it, and walk away. Your calendar fills itself.
 </p>
 </div>
 </div>

 {/* Feature 3 */}
 <div className="md:col-span-7 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative">
 {/* Interactive Mockup: AI Studio with typing and generating */}
 <AIContentStudioMockup />
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <Sparkles className="w-5 h-5 text-[#d75a34]" /> AI content studio - you pull the trigger.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 Drop a topic. ShipOS's AI builds you a ready-to-publish post. Already have a draft? Drop it in and let AI sharpen it. You stay in control of every word - the AI just removes the hard part. Nothing goes live until you say so.
 </p>
 </div>
 </div>
 {/* Feature 4 */}
 <div className="md:col-span-5 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative">
 {/* Interactive Calendar Mockup matching actual app UI */}
 <CalendarMockup />
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <CalendarDays className="w-5 h-5 text-[#d75a34]" /> A visual calendar that shows you everything.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 See your entire posting schedule across every platform in one clean grid. Drag to reschedule. Spot the gaps. Fill them fast. Your whole month at a glance - no spreadsheets, no guessing.
 </p>
 </div>
 </div>

 {/* Feature 5 */}
 <div className="md:col-span-5 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative">
 <SlideshowStudioMockup />
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <Images className="w-5 h-5 text-[#d75a34]" /> Slideshow Studio for visual carousels.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 Design beautiful social slides for LinkedIn or Instagram right inside your dashboard. Pick stunning display fonts, customize backgrounds, and format text casing in one click. Export to PDF and schedule.
 </p>
 </div>
 </div>

 {/* Feature 6 */}
 <div className="md:col-span-7 bg-white dark:bg-[#1f1d1b] rounded-none p-3 pb-8 border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
 <div className="bg-[#fcf5f3] dark:bg-[#191715] rounded-none h-56 mb-8 flex items-center justify-center overflow-hidden p-6 relative border-b border-[#f0dfd8]/30 dark:border-b-neutral-800/80">
 <div className="w-full max-w-lg">
 <AnalyticsDashboardMockup />
 </div>
 </div>
 <div className="px-5">
 <h3 className="text-lg font-bold text-[#1c2024] dark:text-foreground mb-3 flex items-center gap-2.5">
 <TrendingUp className="w-5 h-5 text-[#d75a34]" /> Analytics that show what works.
 </h3>
 <p className="text-[13px] text-[#4b5563] dark:text-muted-foreground font-medium leading-relaxed">
 See how every post performs across all your platforms in one place. Likes, comments, views, reach - all your numbers, one dashboard. No more logging into five apps to understand your audience. Know what lands, and grow with data behind every decision.
 </p>
 </div>
 </div>
 </div>

 </div>
 </FadeIn>
 </section>

 {/* Platforms Section */}
 <section id="bento" className="py-20 px-4 md:px-8 max-w-[1400px] mx-auto border-t border-border/20">
 <FadeIn>
 <div className="text-center mb-16 flex flex-col items-center">
 <SectionBadge label="Integrations" text="Connect everywhere your audience lives" />
 <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1c2024] dark:text-foreground mt-2">
 One platform. Unlimited reach.
 </h2>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
 {socialBadges.map((platform, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
 whileHover={{ y: -4, boxShadow: isDark ?"6px 6px 0px 0px rgba(215,90,52,0.4)" :"6px 6px 0px 0px rgba(215,90,52,1)" }}
 className="group relative bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/80 dark:border-neutral-800/80 p-8 flex flex-col items-center justify-center gap-5 hover:border-[#d75a34] dark:hover:border-[#d75a34] transition-colors duration-300 rounded-none cursor-pointer"
 >
 <div className={cn("w-14 h-14 flex items-center justify-center text-white rounded-none shadow-sm group-hover:scale-110 transition-transform duration-300", platform.bg)}>
 {platform.icon}
 </div>
 <span className="font-bold text-[#1c2024] dark:text-foreground text-base tracking-tight">{platform.name ==="Bird Twitter" ?"Twitter Classic" : platform.name}</span>
 </motion.div>
 ))}
 </div>
 </FadeIn>
 </section>

 {/* Social Proof / Testimonials */}
 <section className="py-24 bg-white dark:bg-[#191715] relative border-t border-[#f0dfd8]/60 dark:border-neutral-800/80">
 <FadeIn>
 <div className="max-w-6xl mx-auto relative z-10">
 <div className="text-center mb-16 px-6 flex flex-col items-center">
 <SectionBadge label="Social Proof" text="Don't just take our word for it" />
 <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1c2024] dark:text-foreground max-w-4xl mx-auto leading-[1.1] mt-2">
 Loved by <span className="text-[#d75a34]">fast-shipping</span> founders and digital creators
 </h2>
 </div>
 </div>

 <TestimonialsMarquee />
 </FadeIn>
 </section>

 {/* Pricing Section */}
 <section id="pricing" className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
 <FadeIn>
 <div className="text-center mb-16">
 <SectionBadge label="Pricing" text="Simple pricing for all your needs" />
 <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
 Pay Less, Post More
 </h2>
 <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
 Start single composer free, toggle annual billing modes to activate active saver rewards.
 </p>

 {/* Billing Switcher Toggle */}
 <div className="flex items-center justify-center gap-4 bg-muted/80 border border-border rounded-none p-1 w-fit mx-auto shadow-sm">
 <span className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer", !isAnnual ?"bg-background text-foreground shadow-sm" :"text-muted-foreground")} onClick={() => setIsAnnual(false)}>
 Monthly
 </span>
 <Switch
 checked={isAnnual}
 onCheckedChange={setIsAnnual}
 className="data-[state=checked]:bg-primary"
 />
 <span className={cn("text-xs font-bold tracking-wider px-4 py-1.5 rounded-none transition-colors cursor-pointer flex items-center", isAnnual ?"bg-background text-foreground shadow-sm" :"text-muted-foreground")} onClick={() => setIsAnnual(true)}>
 Annual Billing
 <Badge className="bg-primary/15 text-primary border-transparent rounded-none text-[8.5px] font-bold py-0.5 px-2 ml-2 shadow-none">
 Save 20%
 </Badge>
 </span>
 </div>
 </div>

 {/* Pricing Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
 {pricingPlans.map((plan, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, y: 40 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
 className="flex flex-col h-full"
 >
 <Card className={cn("h-full border border-border/80 rounded-none bg-card text-card-foreground flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300", plan.popular ?"border-primary/50 ring-1 ring-primary/25" :"")}>
 {plan.badge && (
 <div className={cn(
"absolute top-4 right-4 text-[8px] font-bold tracking-wider px-2.5 py-1 rounded-none shadow-sm animate-pulse",
 plan.popular ?"bg-primary text-white" :"bg-foreground text-background"
 )}>
 {plan.badge}
 </div>
 )}
 
 <CardContent className="p-8 flex-1 flex flex-col justify-between text-left bg-background/30">
 <div className="space-y-6">
 <div>
 <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">{plan.name}</h3>
 <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
 </div>

 <div className="border-t border-b border-border/60 py-4 flex items-baseline">
 {isAnnual ? (
 <div className="flex items-baseline space-x-2 flex-wrap">
 <span className="text-4xl font-bold text-foreground font-mono">${plan.price.annual}</span>
 <span className="text-xs font-semibold text-muted-foreground mr-2">/year</span>
 <span className="text-sm font-medium text-muted-foreground/60 line-through font-mono">
 ${plan.price.monthly * 12}
 </span>
 <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-none ml-1">
 Save 20%
 </span>
 </div>
 ) : (
 <div className="flex items-baseline space-x-1">
 <span className="text-4xl font-bold text-foreground font-mono">${plan.price.monthly}</span>
 <span className="text-xs font-semibold text-muted-foreground">/month</span>
 </div>
 )}
 </div>

 <div className="space-y-3">
 <span className="text-xs font-bold tracking-wider text-muted-foreground block">Includes Features:</span>
 {plan.features.map((f, i) => (
 <div key={i} className="flex items-start space-x-2 text-sm font-semibold text-foreground/90">
 <Check className="w-4 h-4 text-primary stroke-[3] mt-0.5 flex-shrink-0" />
 <span>{f}</span>
 </div>
 ))}
 </div>

 {plan.limitations.length > 0 && (
 <div className="space-y-2 border-t border-border/40 pt-4">
 <span className="text-xs font-bold tracking-wider text-muted-foreground block">Limitations:</span>
 {plan.limitations.map((l, i) => (
 <div key={i} className="flex items-start space-x-2 text-xs font-medium text-muted-foreground">
 <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-none mt-1.5 flex-shrink-0" />
 <span>{l}</span>
 </div>
 ))}
 </div>
 )}
 </div>

 <Button
 onClick={() => navigate("/signup")}
 className={cn(
"w-full h-12 rounded-none shadow-sm hover:shadow transition-all font-bold text-sm normal-case tracking-wider mt-8 flex items-center justify-center gap-2",
 plan.popular ?"bg-primary hover:bg-primary/95 text-white" :"bg-background hover:bg-muted text-foreground border border-border"
 )}
 >
 Try it for $0 (7-days)
 <ArrowRight className="w-4 h-4" />
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>

 {/* Social strip — Post to: */}
 <FadeIn delay={0.2}>
 <div className="flex flex-row items-center justify-center gap-2 mt-10 pt-8 border-t border-border/40 w-full overflow-hidden">
 <span className="text-sm font-semibold text-muted-foreground mr-1 shrink-0">Post to:</span>
 <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
 {socialBadges.map((badge, idx) => (
 <div
 key={idx}
 className={cn(
 "relative group w-8 h-8 sm:w-9 sm:h-9 rounded-none flex items-center justify-center border border-black/5 shadow-sm [&_svg]:w-4 [&_svg]:h-4 shrink-0",
 badge.bg
 )}
 >
 {badge.icon}
 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
 {badge.name}
 </span>
 </div>
 ))}
 </div>
 </div>
 </FadeIn>
 </FadeIn>
 </section>

 {/* FAQ Section */}
 <section id="faq" className="py-24 px-6 lg:px-8 border-t border-border/80 bg-card/5 relative">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
 {/* Left Column: Heading & Contact info */}
 <FadeIn direction="left" className="lg:col-span-5 space-y-6 text-left">
 <SectionBadge label="FAQ" text="Frequently Asked Questions" />
 <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
 Frequently Asked Questions
 </h2>
 <p className="text-base text-muted-foreground leading-relaxed font-semibold max-w-md">
 Have questions about the platform, pricing, or technical details? We've compiled the answers to the most common queries here.
 </p>
 <div className="pt-6 border-t border-border/60">
 <p className="text-sm font-bold text-foreground mb-2">Still have questions?</p>
 <p className="text-xs font-semibold text-muted-foreground mb-4">Can't find what you're looking for? Reach out directly to our human support team.</p>
 <a
 href="mailto:support@shipos.com"
 className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-primary hover:text-primary/80 transition-colors"
 >
 Contact support team
 <ArrowRight className="w-3.5 h-3.5" />
 </a>
 </div>
 </FadeIn>

 {/* Right Column: Accordions */}
 <div className="lg:col-span-7 divide-y divide-border/60 text-left">
 {faqs.map((faq, idx) => {
 const isOpen = activeFaq === idx;
 return (
 <motion.div
 key={idx}
 initial={{ opacity: 0, x: 30 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
 className="py-4 first:pt-0 last:pb-0"
 >
 <button
 onClick={() => setActiveFaq(isOpen ? null : idx)}
 className="w-full flex justify-between items-center text-left focus:outline-none focus:ring-0 group py-3"
 >
 <span className={cn(
"text-base font-bold transition-colors pr-6 normal-case leading-snug",
 isOpen ?"text-[#d75a34]" :"text-foreground group-hover:text-[#d75a34]"
 )}>
 {faq.question}
 </span>
 <div className={cn(
"w-7 h-7 rounded-none flex items-center justify-center border transition-all duration-300 flex-shrink-0",
 isOpen ?"border-[#d75a34]/30 bg-[#d75a34]/5 text-[#d75a34] rotate-180" :"border-border text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground"
 )}>
 <ChevronDown className="w-4 h-4" />
 </div>
 </button>
 
 {isOpen && (
 <div className="pb-4 pt-2 text-sm font-semibold text-muted-foreground/80 leading-relaxed animate-accordion-down">
 {faq.answer}
 </div>
 )}
 </motion.div>
 );
 })}
 </div>
 </div>
 </div>
 </section>

 {/* Dynamic CTA */}
  <section className="py-24 px-6 lg:px-8 bg-background relative">
    <FadeIn>
      <div className="max-w-[1000px] mx-auto relative">
        <div className="relative rounded-none bg-white dark:bg-[#1c1917] border-x-2 border-b-2 border-t-[8px] border-x-black border-b-black border-t-[#d75a34] dark:border-x-neutral-800 dark:border-b-neutral-800 p-10 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex flex-col items-center">
          
          {/* Logo centered */}
          <div className="flex justify-center mb-6 select-none">
            <img 
              src={isDark ? "/logo-white.png" : "/logo-black.png"} 
              alt="ShipOS Logo" 
              className="h-8 w-auto object-contain" 
            />
          </div>
          
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-3xl">
            Your content is ready. Your audience is waiting. ShipOS ships it.
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Takes less than 5 minutes to connect your first platform and schedule your first post.
          </p>
          
          {/* Social Icons row */}
          <div className="flex flex-row flex-nowrap items-center justify-center gap-2.5 sm:gap-6 mb-10 overflow-x-auto no-scrollbar w-full select-none py-1">
            {ctaSocialOrder.map(name => {
              const badge = socialBadges.find(b => b.name === name);
              if (!badge) return null;
              return (
                <div key={name} title={badge.name} className="transition-transform duration-200 hover:scale-110 shrink-0">
                  {renderCTASocialIcon(badge.name, badge.icon, badge.bg)}
                </div>
              );
            })}
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => navigate("/signup")}
            className="h-14 px-8 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none border-2 border-black dark:border-neutral-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(215,90,52,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 font-bold text-base tracking-wide flex items-center justify-center gap-2 group"
          >
            Try it for $0 (7-days)
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

        </div>
      </div>
    </FadeIn>
  </section>

 {/* Footer */}
 <Footer />
 </div>
 );
};

export default Index;
