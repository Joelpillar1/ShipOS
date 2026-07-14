import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  faqSchema,
} from "@/lib/seo";
import { useTheme } from "next-themes";
import { ThemeToggle } from "../components/ThemeToggle";
import { Header } from "@/components/Header";
import { ContentStudioMockup } from "@/components/ContentStudioMockup";
import { BulkScheduleMockup } from "@/components/BulkScheduleMockup";
import { AnalyticsDashboardMockup } from "@/components/AnalyticsDashboardMockup";
import { SlideshowStudioMockup } from "@/components/SlideshowStudioMockup";
import { DashboardCalendarPreview } from "@/components/DashboardCalendarPreview";
import { SocialOrbitAnimation } from "@/components/SocialOrbitAnimation";
import { FounderStory } from "@/components/FounderStory";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/postStorage";
import {
  MarketingPricingBillingToggle,
  MarketingPricingCards,
} from "@/components/MarketingPricingCards";
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
} from "lucide-react";

// Types for interactive widgets
type Platform = "x" | "linkedin" | "instagram";
type AIPromptType = "hook" | "thread" | "cta";

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }: { children: React.ReactNode, delay?: number, direction?: "up" | "down" | "left" | "right" | "none", className?: string }) => {
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionBadge = ({ label, text, mobileText }: { label: string; text: string; mobileText?: string }) => (
  <div className="inline-flex items-center gap-2 border border-[#d75a34]/60 rounded-full p-1 pr-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm shadow-sm mb-6 max-w-full">
    <div className="bg-gradient-to-b from-[#e36e4b] to-[#d75a34] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-inner shrink-0 whitespace-nowrap">
      {label}
    </div>
    <span className="text-[13px] font-semibold text-gray-800 dark:text-neutral-200 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
      <span className={mobileText ? "hidden sm:inline" : "inline"}>{text}</span>
      {mobileText && <span className="inline sm:hidden">{mobileText}</span>}
    </span>
  </div>
);

const AnimatedCounter = ({
  value,
  duration = 1.2,
  start,
}: {
  value: string;
  duration?: number;
  start: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!start) return;

    const target = parseFloat(value);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const hasDecimal = value.includes(".");
    const decimalPlaces = hasDecimal ? value.split(".")[1].length : 0;

    let startTime: number | null = null;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      const easeProgress = progress * (2 - progress);
      const current = easeProgress * target;

      setDisplayValue(current.toFixed(decimalPlaces));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [start, value, duration]);

  return <span>{displayValue}</span>;
};

const Index = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const socialCountersRef = useRef<HTMLDivElement>(null);
  const socialCountersInView = useInView(socialCountersRef, { once: true, amount: 0.15 });

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
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // 3. Bento Grid - Interactive AI Writer State
  const [aiPrompt, setAiPrompt] = useState<AIPromptType>("hook");
  const [aiOutputText, setAiOutputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 4. Bento Grid - Interactive Calendar State
  const [selectedDay, setSelectedDay] = useState<number>(19);
  const [calendarPosts, setCalendarPosts] = useState<Record<number, { time: string; platform: Platform; text: string }[]>>({
    17: [
      { time: "9:00 AM", platform: "x", text: "Product launch countdown begins!" },
    ],
    19: [
      { time: "12:30 PM", platform: "x", text: "Deep dive into cross-platform content strategy." },
      { time: "6:15 PM", platform: "linkedin", text: "Why visual schedulers double creator conversion rate." },
    ],
    22: [
      { time: "8:00 AM", platform: "instagram", text: "ShipOS Office Hours Live Session Announcement." },
    ],
    24: [
      { time: "4:00 PM", platform: "x", text: "Evergreen content series: 5 tips to scale SaaS." },
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
          window.scrollTo({ top, behavior: "smooth" });
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
      id: "deploy-toast",
    });

    setTimeout(() => {
      toast.success(`Published! Content deployed live to ${activeDestinations.join(",")}!`, {
        id: "deploy-toast",
        description: "Analytics will start updating immediately.",
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
      hook: "💡 Hook: 90% of creators fail because they compile posts manually. Here's our exact 3-step stack that saves 10 hours a week...",
      thread: "🧵 Thread Outline:\n1/ Deep problem analysis\n2/ High-fidelity solution workflow\n3/ Actionable case study showing +240% ROI\n4/ Dynamic evergreen CTA.",
      cta: "🔥 Call to Action: Ready to scale your brand on autopilot? Use ShipOS's multi-platform composer free for 7 days. Link in bio! 👇",
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
      platform: "x" as Platform,
      text: newSlotText,
    };

    setCalendarPosts((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newPost],
    }));

    setNewSlotText("");
    toast.success(`Post successfully scheduled for May ${selectedDay} at ${newSlotTime}!`);
  };

  const faqs = [
    {
      question: "Which social media platforms does ShipOS support?",
      answer: "ShipOS supports all major networks including X (Twitter), LinkedIn, Instagram, Threads, Bluesky, TikTok, Pinterest, Facebook, and YouTube. You can connect multiple profiles and publish or schedule text, images, and video content directly from one place.",
    },
    {
      question: "How does the cross-platform composer handle different network limits?",
      answer: "Our smart composer gives you a unified workspace while letting you customize tabs for each platform. We automatically track character limits (e.g., 280 for X, 3000 for LinkedIn), image aspect ratios, and format rules.",
    },
    {
      question: "How does the visual calendar drag-and-drop scheduling work?",
      answer: "The interactive visual calendar displays all your scheduled posts across all platforms. If you need to rearrange your queue, simply drag a post card and drop it onto another day. ShipOS updates the scheduled date in the database automatically.",
    },
    {
      question: "What is Bulk Scheduling and how do I use it?",
      answer: "Bulk Scheduling allows you to queue up to 10 posts on Starter, 25 posts on Creator, and 50 posts on Pro at once. You upload a CSV, TSV, or Text template with columns for your content, media URLs, scheduled date/time, and platform channels. Our system parses the file in real-time, highlights any errors, and lets you import and schedule everything in bulk.",
    },
    {
      question: "What are AI Credits and how does the AI Content Studio help me?",
      answer: "The AI Content Studio assists you in generating hooks, formatting posts, or writing engaging calls-to-action (CTAs). A credit is consumed when you run an AI generation prompt. Starter plans include 100 credits/mo, Creator plans include 400 credits/mo, and Pro plans offer unlimited credits.",
    },
    {
      question: "Is it safe to connect my official brand accounts to ShipOS?",
      answer: "Yes, completely safe. ShipOS connects to your profiles using secure, official OAuth 2.0 API integrations. We never see or store your social passwords, and all social tokens are securely encrypted in transit and at rest. You can disconnect accounts at any time.",
    },
    {
      question: "Is there a free trial, and can I cancel or change plans?",
      answer: "Yes! We offer a 7-day fully functional free trial on all paid plans. You can cancel, upgrade, or downgrade your plan at any time directly from the settings billing dashboard with a single click.",
    },
  ];

  // Social badges for the hero center-stack
  const socialBadges = [
    {
      name: "LinkedIn",
      bg: "bg-[#0077B5]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "Threads",
      bg: "bg-[#101010]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      bg: "bg-[#101010]",
      icon: (
        <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Bluesky",
      bg: "bg-[#0285FF]",
      icon: (
        <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 320 286">
          <path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      bg: "bg-[#010101]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      bg: "bg-[#BD081C]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      bg: "bg-[#1877F2]",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      bg: "bg-[#FF0000]",
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
        backgroundColor: isDark ? "transparent" : "#FAF7F5",
      }}
    >
      <SEO
        title="ShipOS — Social Media Scheduling & Management Tool for Everyone"
        description="Plan, write, schedule, and publish across X, LinkedIn, Instagram, TikTok, Threads, Facebook, Bluesky, Pinterest & YouTube from one workspace. Content Studio, Slideshow Studio, bulk CSV/TSV/Text scheduling, a visual calendar, and analytics. Start a 7-day free trial."
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

      {/* Top Navbar — sits below the promo banner via --banner-h CSS var */}
      <Header />

      {/* Brand-Aligned Hero Section — full-width background wrapper */}
      <div className="relative z-10 w-full overflow-hidden">
        {/* Real <img> (not CSS background) so LCP can discover + prioritize it */}
        <img
          src="/hero-bg.webp"
          alt=""
          width={1024}
          height={638}
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute left-1/2 top-0 z-0 h-auto w-[150%] max-w-none -translate-x-1/2 select-none"
          aria-hidden="true"
        />

        {/* Constrained content */}
        <section className="hero-header-padding pb-20 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto text-center relative z-10">
          <FadeIn delay={0.1} className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">

            {/* Social Platform Icons — squares at the top */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              {/* X / Twitter */}
              <div title="X (Twitter)" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-black dark:bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.733-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
              </div>
              {/* LinkedIn */}
              <div title="LinkedIn" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-[#0A66C2] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </div>
              {/* Threads */}
              <div title="Threads" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-black dark:bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 192 192" className="w-3 h-3 sm:w-4 sm:h-4 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M141.537 88.9883C140.55 88.5919 139.55 88.2104 138.548 87.8427C136.811 61.9671 122.385 47.4197 100.023 47.2913C99.8809 47.2905 99.7389 47.2898 99.5971 47.2898C86.7284 47.2898 75.9028 52.9648 69.3013 62.8905L80.3698 70.0551C85.3591 62.3848 93.4649 60.5918 99.6069 60.5918C99.7133 60.5918 99.82 60.5921 99.9266 60.5928C107.976 60.6465 113.987 63.0413 117.777 67.7066C120.45 71.0178 122.179 75.5523 122.952 81.2436C116.757 80.2285 110.062 79.9099 102.93 80.2965C81.1609 81.5175 67.1847 94.0917 68.0947 112.286C68.5538 121.478 73.0527 129.317 80.7524 134.389C87.2745 138.717 95.7413 140.837 104.545 140.346C116.151 139.699 125.203 135.291 131.474 127.234C136.242 121.122 139.2 112.991 140.366 102.675C145.437 105.77 149.183 110.088 151.19 115.335C154.681 124.553 154.895 139.566 143.241 151.181C132.891 161.48 120.531 166.066 101.542 166.199C80.4998 166.065 64.3199 159.299 53.5167 146.014C43.4264 133.567 38.2187 115.575 38.0001 93C38.2187 70.4253 43.4264 52.4338 53.5167 39.9868C64.3199 26.7016 80.4998 19.9349 101.542 19.8011C122.732 19.936 139.315 26.7316 150.441 40.1011C155.957 46.7144 160.117 55.2012 162.856 65.4089L175.297 62.0898C172.014 49.9619 166.811 39.3789 159.681 30.5671C145.671 13.4121 125.648 4.61505 101.619 4.4801H101.536C77.5577 4.61505 57.9049 13.4404 44.2009 30.6471C31.9527 46.2079 25.6367 68.0989 25.4007 94.9889L25.4 96L25.4007 97.0111C25.6367 123.901 31.9527 145.792 44.2009 161.353C57.9049 178.56 77.5577 187.385 101.536 187.52H101.619C122.873 187.395 137.8 181.529 149.342 170.025C164.745 154.663 164.276 135.497 159.029 122.422C155.253 112.856 147.827 105.02 138.003 99.9996C137.273 96.3094 136.294 92.8965 135.075 89.7884C133.921 86.8558 132.784 84.3994 131.698 82.3764C131.643 82.2736 131.588 82.1715 131.534 82.0704L141.537 88.9883Z" /></svg>
              </div>
              {/* Bluesky */}
              <div title="Bluesky" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-[#0085FF] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 600 530" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M135.72 44.03C202.216 93.951 273.74 195.17 300 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.018-2.936-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.449-163.25-81.433C20.155 217.613 10 86.535 10 68.825c0-88.687 77.742-60.816 125.72-24.795z" /></svg>
              </div>
              {/* Pinterest */}
              <div title="Pinterest" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-[#E60023] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.365 11.99-11.987C24.006 5.367 18.641 0 12.017 0z" /></svg>
              </div>
              {/* Instagram */}
              <div title="Instagram" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </div>
              {/* Facebook */}
              <div title="Facebook" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-[#1877F2] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </div>
              {/* YouTube */}
              <div title="YouTube" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-[#FF0000] flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </div>
              {/* TikTok */}
              <div title="TikTok" className="w-7 h-7 sm:w-9 sm:h-9 rounded-none bg-black flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-4 sm:h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>
              </div>
            </div>

            {/* Two-line Headline */}
            <h1 className="select-none tracking-tight w-full">
              <span className="block whitespace-nowrap font-extrabold text-[#1A1A1A] dark:text-neutral-100" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.75rem)', lineHeight: 1.1 }}>
                One Dashboard, Ship
              </span>
              <span className="block whitespace-nowrap font-extrabold" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.75rem)', lineHeight: 1.2 }}>
                <span className="text-[#1A1A1A] dark:text-neutral-100">Everywhere </span>
                <span className="text-[#d75a34] font-normal italic">in 60 Seconds</span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-500 dark:text-neutral-400 text-base sm:text-lg font-medium max-w-xl">
              Posting to 9 platforms used to mean 9 times <br className="sm:hidden" />the work. Not anymore.
            </p>

            {/* Badges Container */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D5E2D6] dark:bg-[#1C2C1D] text-[#2C4A2E] dark:text-[#A0C0A3] border border-black dark:border-white rounded-none text-base md:text-lg font-bold whitespace-nowrap hover:-translate-y-1 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer transition-all duration-200">
                <Send className="w-4 h-4 shrink-0" /> Posting
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E2DBEC] dark:bg-[#251A33] text-[#4A3764] dark:text-[#C5B3E0] border border-black dark:border-white rounded-none text-base md:text-lg font-bold whitespace-nowrap hover:-translate-y-1 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer transition-all duration-200">
                <Calendar className="w-4 h-4 shrink-0" /> Scheduling
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F3DFD2] dark:bg-[#331C10] text-[#6A391E] dark:text-[#E2A683] border border-black dark:border-white rounded-none text-base md:text-lg font-bold whitespace-nowrap hover:-translate-y-1 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer transition-all duration-200">
                <Images className="w-4 h-4 shrink-0" /> Slideshow
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D4E2F3] dark:bg-[#122233] text-[#1E3A5F] dark:text-[#8BB3E2] border border-black dark:border-white rounded-none text-base md:text-lg font-bold whitespace-nowrap hover:-translate-y-1 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer transition-all duration-200">
                <BarChart3 className="w-4 h-4 shrink-0" /> Analytics
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F3D6DF] dark:bg-[#33121C] text-[#6A1E35] dark:text-[#E28BA1] border border-black dark:border-white rounded-none text-base md:text-lg font-bold whitespace-nowrap hover:-translate-y-1 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer transition-all duration-200">
                <Sparkles className="w-4 h-4 shrink-0" /> AI Content Studio
              </span>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-center w-full">
              <Button
                onClick={() => navigate("/signup")}
                variant="marketing" className="w-full sm:w-auto px-12 h-16 text-xl tracking-wide group"
              >
                Try for $0 for 7days <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* Demo Video Preview Box Mockup */}
        <section className="relative z-20 pb-8 px-4 md:px-8 max-w-6xl mx-auto">
          <FadeIn delay={0.2}>
            <div
              onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
              className={cn(
                "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group overflow-hidden rounded-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
                isPlayingDemo ? "cursor-default" : "cursor-pointer"
              )}
            >
              {isPlayingDemo ? (
                <iframe
                  src="https://www.youtube.com/embed/huwiFpCP614?autoplay=1"
                  title="ShipOS Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              ) : (
                <>
                  {/* Top Bar for Window effect */}
                  <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center px-3 gap-2 border-b-2 border-black z-20">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    <div className="ml-2 text-white/90 text-[10px] font-bold tracking-widest uppercase">ShipOS_Platform_Demo.mp4</div>
                  </div>

                  {/* Thumbnail — sddefault is ~640px; maxresdefault is oversized for this slot */}
                  <img
                    src="https://img.youtube.com/vi/huwiFpCP614/sddefault.jpg"
                    alt="ShipOS Platform Demo Preview"
                    width={640}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover mt-8 group-hover:scale-[1.02] transition-transform duration-500"
                  />

                  {/* Dark overlay for readability and premium feel */}
                  <div className="absolute inset-0 mt-8 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
                    {/* Play Button */}
                    <div className="relative z-10 w-20 h-20 bg-[#d75a34] rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </section>
      </div>

      {/* Socials Reach Section */}
      <section className="relative z-20 py-20 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/20">
        <FadeIn>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <SectionBadge label="Scale" text="Go where the attention is" mobileText="Reach" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#1c2024] dark:text-foreground">
              Publish to 11.9 billion people.<br />
              <span className="text-[#d75a34] italic font-normal">Without 9 open browser tabs.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Write your post once, tweak it for each network, and ship everywhere in a single click.
            </p>
          </div>

          <div ref={socialCountersRef} className="flex flex-wrap justify-center gap-4">
            {[
              {
                name: "Facebook",
                count: "3.0",
                suffix: "B",
                subtitle: "Pages and groups",
                bg: "bg-[#1877F2]",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )
              },
              {
                name: "YouTube",
                count: "2.5",
                suffix: "B",
                subtitle: "Shorts and long-form",
                bg: "bg-[#FF0000]",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                )
              },
              {
                name: "Instagram",
                count: "2.0",
                suffix: "B",
                subtitle: "Reels and carousels",
                bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                )
              },
              {
                name: "TikTok",
                count: "1.6",
                suffix: "B",
                subtitle: "Short-form & trends",
                bg: "bg-black",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                  </svg>
                )
              },
              {
                name: "LinkedIn",
                count: "1.0",
                suffix: "B",
                subtitle: "Professional network",
                bg: "bg-[#0A66C2]",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )
              },
              {
                name: "Pinterest",
                count: "630",
                suffix: "M",
                subtitle: "Visual discovery",
                bg: "bg-[#E60023]",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.365 11.99-11.987C24.006 5.367 18.641 0 12.017 0z" />
                  </svg>
                )
              },
              {
                name: "X",
                count: "600",
                suffix: "M",
                subtitle: "Real-time conversation",
                bg: "bg-black dark:bg-white",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.733-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                  </svg>
                )
              },
              {
                name: "Threads",
                count: "500",
                suffix: "M",
                subtitle: "Text-based sharing",
                bg: "bg-black dark:bg-white",
                icon: (
                  <svg viewBox="0 0 192 192" className="w-5 h-5 fill-white dark:fill-black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M141.537 88.9883C140.55 88.5919 139.55 88.2104 138.548 87.8427C136.811 61.9671 122.385 47.4197 100.023 47.2913C99.8809 47.2905 99.7389 47.2898 99.5971 47.2898C86.7284 47.2898 75.9028 52.9648 69.3013 62.8905L80.3698 70.0551C85.3591 62.3848 93.4649 60.5918 99.6069 60.5918C99.7133 60.5918 99.82 60.5921 99.9266 60.5928C107.976 60.6465 113.987 63.0413 117.777 67.7066C120.45 71.0178 122.179 75.5523 122.952 81.2436C116.757 80.2285 110.062 79.9099 102.93 80.2965C81.1609 81.5175 67.1847 94.0917 68.0947 112.286C68.5538 121.478 73.0527 129.317 80.7524 134.389C87.2745 138.717 95.7413 140.837 104.545 140.346C116.151 139.699 125.203 135.291 131.474 127.234C136.242 121.122 139.2 112.991 140.366 102.675C145.437 105.77 149.183 110.088 151.19 115.335C154.681 124.553 154.895 139.566 143.241 151.181C132.891 161.48 120.531 166.066 101.542 166.199C80.4998 166.065 64.3199 159.299 53.5167 146.014C43.4264 133.567 38.2187 115.575 38.0001 93C38.2187 70.4253 43.4264 52.4338 53.5167 39.9868C64.3199 26.7016 80.4998 19.9349 101.542 19.8011C122.732 19.936 139.315 26.7316 150.441 40.1011C155.957 46.7144 160.117 55.2012 162.856 65.4089L175.297 62.0898C172.014 49.9619 166.811 39.3789 159.681 30.5671C145.671 13.4121 125.648 4.61505 101.619 4.4801H101.536C77.5577 4.61505 57.9049 13.4404 44.2009 30.6471C31.9527 46.2079 25.6367 68.0989 25.4007 94.9889L25.4 96L25.4007 97.0111C25.6367 123.901 31.9527 145.792 44.2009 161.353C57.9049 178.56 77.5577 187.52H101.536H101.619C122.873 187.395 137.8 181.529 149.342 170.025C164.745 154.663 164.276 135.497 159.029 122.422C155.253 112.856 147.827 105.02 138.003 99.9996C137.273 96.3094 136.294 92.8965 135.075 89.7884C133.921 86.8558 132.784 84.3994 131.698 82.3764C131.643 82.2736 131.588 82.1715 131.534 82.0704L141.537 88.9883Z" />
                  </svg>
                )
              },
              {
                name: "Bluesky",
                count: "45",
                suffix: "M",
                subtitle: "Open social web",
                bg: "bg-[#0085FF]",
                icon: (
                  <svg viewBox="0 0 600 530" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M135.72 44.03C202.216 93.951 273.74 195.17 300 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.018-2.936-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.449-163.25-81.433C20.155 217.613 10 86.535 10 68.825c0-88.687 77.742-60.816 125.72-24.795z" />
                  </svg>
                )
              }
            ].map((social) => (
              <div
                key={social.name}
                className="flex flex-col items-start p-5 bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] dark:hover:border-neutral-700 transition-all duration-300 w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)] lg:w-[calc(20%-13px)] min-w-[110px] min-h-[170px] justify-between"
              >
                {/* Platform Icon Bubble */}
                <div className={cn("w-10 h-10 rounded-none flex items-center justify-center shadow-inner shrink-0", social.bg)}>
                  {social.icon}
                </div>

                <div className="flex flex-col mt-4">
                  {/* Big Count Number */}
                  <div className="flex items-baseline gap-0.5 leading-none">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground"><AnimatedCounter value={social.count} start={socialCountersInView} /></span>
                    <span className="text-sm font-bold text-[#d75a34]">{social.suffix}</span>
                  </div>

                  {/* Title & Description */}
                  <div className="text-[13px] font-bold text-foreground mt-2 leading-tight">{social.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{social.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Flow Animation Section */}
      <section className="relative z-20 py-20 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/20">
        <FadeIn>
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <SectionBadge label="Workflow" text="How it all comes together" mobileText="How it works" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The ShipOS Funnel</h2>
            <p className="text-muted-foreground text-lg">Integrate everything. AI structures the noise into high-converting posts instantly.</p>
          </div>
          <SocialOrbitAnimation />
        </FadeIn>
      </section>

      {/* Redesigned Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 max-w-6xl mx-auto space-y-24">
        {/* Header Row */}
        <FadeIn>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 pb-12 border-b border-[#f0dfd8]/60 dark:border-neutral-800/60">
            <div className="flex flex-col items-start">
              <SectionBadge label="Features" text="Powerful platform capabilities" mobileText="Platform capabilities" />
              <h2 className="text-4xl md:text-5xl font-medium text-[#1c2024] dark:text-foreground tracking-tight max-w-xl leading-tight mt-2">
                Everything you need.<br />Nothing you don't.
              </h2>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-5 max-w-sm">
              <p className="text-[#4b5563] dark:text-muted-foreground text-sm leading-relaxed text-left lg:text-right font-medium">
                Unlock the power of unified social velocity, campaign management, and deep growth analytics with ShipOS's comprehensive solution.
              </p>
              <Button onClick={() => navigate("/signup")} variant="marketingOutline" className="font-semibold px-6 py-2 h-auto group">
                Try it for $0 (7-days)
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Feature List (Alternating Rows) */}
        {[
          {
            badge: "Publishing",
            badgeIcon: <LayoutGrid className="w-3.5 h-3.5" />,
            title: <>Publish posts <span className="text-[#d75a34] font-normal italic">effortlessly</span></>,
            desc: "One post. Every platform. One click. ShipOS automatically formats your content to match each platform's rules - character limits, image ratios, spacing - so it looks native everywhere it lands.",
            mockupScale: "scale-115 sm:scale-120 md:scale-[1.28] lg:scale-[1.38] transition-transform duration-500 origin-center",
            mockup: (
              <div className="w-full max-w-[280px] flex flex-col items-center relative overflow-hidden">
                <div className="h-8 flex items-center justify-center mb-2 z-10 relative">
                  <img src={isDark ? "/logo-white.png" : "/logo-black.png"} alt="ShipOS Logo" className="h-7 w-auto" />
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
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    {/* First Set */}
                    <div className="w-10 h-10 bg-[#0077B5] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></div>
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
                    <div className="w-10 h-10 bg-[#101010] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" /></svg></div>
                    <div className="w-10 h-10 bg-[#0285FF] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" /></svg></div>
                    <div className="w-10 h-10 bg-[#010101] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></div>
                    <div className="w-10 h-10 bg-[#BD081C] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" /></svg></div>
                    <div className="w-10 h-10 bg-[#1877F2] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></div>

                    {/* Duplicated for smooth infinite scrolling */}
                    <div className="w-10 h-10 bg-[#0077B5] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></div>
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
                    <div className="w-10 h-10 bg-[#101010] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" /></svg></div>
                    <div className="w-10 h-10 bg-[#0285FF] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z" /></svg></div>
                    <div className="w-10 h-10 bg-[#010101] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg></div>
                    <div className="w-10 h-10 bg-[#BD081C] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z" /></svg></div>
                    <div className="w-10 h-10 bg-[#1877F2] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></div>
                    <div className="w-10 h-10 bg-[#FF0000] text-white rounded-none flex items-center justify-center shrink-0 border border-black/5 shadow-sm"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></div>
                  </motion.div>
                </div>
              </div>
            ),
            cta1: { text: "Start publishing", link: "/create-post" },
            cta2: { text: "Connect Accounts", link: "/connect-accounts" }
          },
          {
            badge: "Bulk Scheduling",
            badgeIcon: <ListTodo className="w-3.5 h-3.5" />,
            title: <>Bulk scheduling that <span className="text-[#d75a34] font-normal italic">saves hours</span></>,
            desc: "Plan your entire week or month in one sitting. Upload, organize, and schedule hundreds of posts at once across all your platforms. Set it, confirm it, and walk away. Your calendar fills itself.",
            mockupScale: "scale-[0.85] sm:scale-95 md:scale-100 transition-transform duration-500 origin-center",
            mockup: <BulkScheduleMockup />,
            cta1: { text: "Try bulk scheduler", link: "/bulk-schedule" },
            cta2: { text: "View schedule", link: "/calendar" }
          },
          {
            badge: "AI Studio",
            badgeIcon: <Sparkles className="w-3.5 h-3.5" />,
            title: <>AI content studio, <span className="text-[#d75a34] font-normal italic">you control</span></>,
            desc: "Drop a topic. ShipOS's AI builds you a ready-to-publish post. Already have a draft? Drop it in and let AI sharpen it. You stay in control of every word - the AI just removes the hard part. Nothing goes live until you say so.",
            mockupScale: "scale-[0.85] sm:scale-95 md:scale-100 transition-transform duration-500 origin-center",
            mockup: <ContentStudioMockup />,
            cta1: { text: "Try AI writer", link: "/content-studio" },
            cta2: { text: "Learn how it works", link: "#" }
          },
          {
            badge: "Visual Calendar",
            badgeIcon: <CalendarDays className="w-3.5 h-3.5" />,
            title: <>A visual calendar <span className="text-[#d75a34] font-normal italic">built for speed</span></>,
            desc: "See your entire posting schedule across every platform in one clean grid. Drag to reschedule. Spot the gaps. Fill them fast. Your whole month at a glance - no spreadsheets, no guessing.",
            mockupScale: "scale-[0.85] sm:scale-95 md:scale-100 transition-transform duration-500 origin-center",
            mockup: (
              <div className="w-full max-w-[640px] bg-card border border-border shadow-sm overflow-hidden rounded-none p-3">
                <DashboardCalendarPreview
                  compact
                  onActionClick={() =>
                    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                />
              </div>
            ),
            cta1: { text: "Plan calendar", link: "/calendar" },
            cta2: { text: "View demo", link: "#" }
          },
          {
            badge: "Slideshow Studio",
            badgeIcon: <Images className="w-3.5 h-3.5" />,
            title: <>Design stunning <span className="text-[#d75a34] font-normal italic">visual carousels</span></>,
            desc: "Design beautiful social slides for LinkedIn or Instagram right inside your dashboard. Pick stunning display fonts, customize backgrounds, and format text casing in one click, then schedule directly to your channels.",
            mockupScale: "scale-[0.85] sm:scale-95 md:scale-100 transition-transform duration-500 origin-center",
            mockup: <SlideshowStudioMockup />,
            cta1: { text: "Start design", link: "/slideshow-studio" },
            cta2: { text: "View templates", link: "/slideshow-studio" }
          },
          {
            badge: "Analytics",
            badgeIcon: <TrendingUp className="w-3.5 h-3.5" />,
            title: <>Analytics that <span className="text-[#d75a34] font-normal italic">drive growth</span></>,
            desc: "See how every post performs across all your platforms in one place. Likes, comments, views, reach - all your numbers, one dashboard. No more logging into five apps to understand your audience.",
            mockupScale: "scale-[0.85] sm:scale-95 md:scale-100 transition-transform duration-500 origin-center",
            mockup: <AnalyticsDashboardMockup />,
            cta1: { text: "See analytics", link: "/analytics" },
            cta2: { text: "Compare plans", link: "#pricing" }
          }
        ].map((feature, idx) => {
          const isEven = idx % 2 === 1;
          const useFounderVisual =
            feature.badge === "Bulk Scheduling" ||
            feature.badge === "AI Studio" ||
            feature.badge === "Visual Calendar" ||
            feature.badge === "Slideshow Studio" ||
            feature.badge === "Analytics";
          const visualPanelClass = cn(
            "w-full lg:w-[55%] bg-[#fcf5f3] dark:bg-[#191715] flex items-center justify-center p-6 lg:p-10 relative overflow-hidden",
            !isEven && "border-b lg:border-b-0 lg:border-r border-[#f0dfd8] dark:border-neutral-800/80",
            useFounderVisual
              ? feature.badge === "Analytics"
                ? "min-h-[340px] sm:min-h-[400px] lg:min-h-[520px] max-h-[380px] sm:max-h-none"
                : feature.badge === "Slideshow Studio"
                ? "min-h-[320px] sm:min-h-[400px] lg:min-h-[460px]"
                : "min-h-[320px] sm:min-h-[400px] lg:min-h-[520px]"
              : "aspect-square lg:aspect-auto lg:min-h-[460px] lg:p-12"
          );
          const meshBg =
            feature.badge !== "Publishing" ? (
              <img
                src="/images/composer/mesh-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                aria-hidden
              />
            ) : null;
          return (
            <FadeIn key={idx} delay={0.1}>
              <div className="bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8] dark:border-neutral-800/80 rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col lg:flex-row w-full mb-12 last:mb-0">
                {!isEven ? (
                  <>
                    {/* Visual Panel */}
                    <div className={visualPanelClass}>
                      {meshBg}
                      <div
                        className={cn(
                          "relative z-10 max-w-full",
                          feature.badge === "Analytics" &&
                            "w-full max-h-[320px] sm:max-h-[380px] md:max-h-none overflow-hidden",
                          (feature.badge === "Slideshow Studio" || feature.badge === "Analytics") &&
                            "w-full max-w-none",
                          feature.mockupScale
                        )}
                      >
                        {feature.mockup}
                      </div>
                    </div>

                    {/* Text Panel */}
                    <div className="w-full lg:w-[45%] p-8 lg:p-12 flex flex-col justify-center items-start text-left bg-white dark:bg-[#1f1d1b]">
                      {/* Badge (Let the section badge be round as they were before) */}
                      <div className="bg-[#fcf5f3] dark:bg-[#191715] text-[#d75a34] px-3 py-1 text-[11px] font-bold tracking-wider uppercase border border-[#d75a34]/30 rounded-full flex items-center gap-2 mb-5">
                        {feature.badgeIcon}
                        <span>{feature.badge}</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1c2024] dark:text-foreground mb-4 leading-tight">
                        {feature.title}
                      </h3>

                      <p className="text-muted-foreground text-[14px] md:text-[15px] leading-relaxed mb-6 font-medium max-w-xl">
                        {feature.desc}
                      </p>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => {
                            if (feature.cta1.link.startsWith("#")) {
                              const target = document.getElementById(feature.cta1.link.substring(1));
                              if (target) target.scrollIntoView({ behavior: "smooth" });
                            } else {
                              navigate(feature.cta1.link);
                            }
                          }}
                          variant="marketing" className="px-5 py-2.5 text-xs group"
                        >
                          {feature.cta1.text}
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                        
                        {feature.cta2.text && (
                          <Button
                            onClick={() => {
                              if (feature.cta2.link.startsWith("#")) {
                                const target = document.getElementById(feature.cta2.link.substring(1));
                                if (target) target.scrollIntoView({ behavior: "smooth" });
                              } else {
                                navigate(feature.cta2.link);
                              }
                            }}
                            variant="marketingOutline" className="px-5 py-2.5 text-xs"
                          >
                            {feature.cta2.text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Text Panel */}
                    <div className="w-full lg:w-[45%] p-8 lg:p-12 flex flex-col justify-center items-start text-left bg-white dark:bg-[#1f1d1b] border-b lg:border-b-0 lg:border-r border-[#f0dfd8] dark:border-neutral-800/80">
                      {/* Badge (Let the section badge be round as they were before) */}
                      <div className="bg-[#fcf5f3] dark:bg-[#191715] text-[#d75a34] px-3 py-1 text-[11px] font-bold tracking-wider uppercase border border-[#d75a34]/30 rounded-full flex items-center gap-2 mb-5">
                        {feature.badgeIcon}
                        <span>{feature.badge}</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1c2024] dark:text-foreground mb-4 leading-tight">
                        {feature.title}
                      </h3>

                      <p className="text-muted-foreground text-[14px] md:text-[15px] leading-relaxed mb-6 font-medium max-w-xl">
                        {feature.desc}
                      </p>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => {
                            if (feature.cta1.link.startsWith("#")) {
                              const target = document.getElementById(feature.cta1.link.substring(1));
                              if (target) target.scrollIntoView({ behavior: "smooth" });
                            } else {
                              navigate(feature.cta1.link);
                            }
                          }}
                          variant="marketing" className="px-5 py-2.5 text-xs group"
                        >
                          {feature.cta1.text}
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                        
                        {feature.cta2.text && (
                          <Button
                            onClick={() => {
                              if (feature.cta2.link.startsWith("#")) {
                                const target = document.getElementById(feature.cta2.link.substring(1));
                                if (target) target.scrollIntoView({ behavior: "smooth" });
                              } else {
                                navigate(feature.cta2.link);
                              }
                            }}
                            variant="marketingOutline" className="px-5 py-2.5 text-xs"
                          >
                            {feature.cta2.text}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Visual Panel */}
                    <div className={visualPanelClass}>
                      {meshBg}
                      <div
                        className={cn(
                          "relative z-10 max-w-full",
                          feature.badge === "Analytics" &&
                            "w-full max-h-[320px] sm:max-h-[380px] md:max-h-none overflow-hidden",
                          (feature.badge === "Slideshow Studio" || feature.badge === "Analytics") &&
                            "w-full max-w-none",
                          feature.mockupScale
                        )}
                      >
                        {feature.mockup}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </FadeIn>
          );
        })}
      </section>

      {/* Platforms Section */}
      <section id="bento" className="py-20 px-4 md:px-8 max-w-6xl mx-auto border-t border-border/20">
        <FadeIn>
          <div className="text-center mb-16 flex flex-col items-center">
            <SectionBadge label="Integrations" text="Connect everywhere your audience lives" mobileText="Connect everywhere" />
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
                whileHover={{ y: -4, boxShadow: isDark ? "6px 6px 0px 0px rgba(215,90,52,0.4)" : "6px 6px 0px 0px rgba(215,90,52,1)" }}
                className="group relative bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/80 dark:border-neutral-800/80 p-8 flex flex-col items-center justify-center gap-5 hover:border-[#d75a34] dark:hover:border-[#d75a34] transition-colors duration-300 rounded-none cursor-pointer"
              >
                <div className={cn("w-14 h-14 flex items-center justify-center text-white rounded-none shadow-sm group-hover:scale-110 transition-transform duration-300", platform.bg)}>
                  {platform.icon}
                </div>
                <span className="font-bold text-[#1c2024] dark:text-foreground text-base tracking-tight">{platform.name === "Bird Twitter" ? "Twitter Classic" : platform.name}</span>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Founder Story Section */}
      <section className="py-24 bg-white dark:bg-[#191715] relative border-t border-[#f0dfd8]/60 dark:border-neutral-800/80">
        <FadeIn>
          <div className="max-w-6xl mx-auto relative z-10 px-6">
            <div className="text-center mb-16 flex flex-col items-center">
              <SectionBadge label="Founder Story" text="Built by a creator, for creators" mobileText="Built for creators" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1c2024] dark:text-foreground max-w-4xl mx-auto leading-[1.1] mt-2">
                You Talk to the Founder. <span className="text-[#d75a34]">Not a Chatbot.</span>
              </h2>
            </div>
            <FounderStory />
          </div>
        </FadeIn>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <SectionBadge label="Pricing" text="Simple pricing for all your needs" mobileText="Simple pricing" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Pay Less, Post More
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
              Start single composer free, toggle annual billing modes to activate active saver rewards.
            </p>

            <MarketingPricingBillingToggle isAnnual={isAnnual} onAnnualChange={setIsAnnual} />
          </div>

          <MarketingPricingCards
            isAnnual={isAnnual}
            onAnnualChange={setIsAnnual}
            showBillingToggle={false}
            animate
            onCtaClick={() => navigate("/signup")}
          />

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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Left Column: Heading & Contact info */}
            <FadeIn direction="left" className="lg:col-span-5 space-y-6 text-left">
              <SectionBadge label="FAQ" text="Frequently Asked Questions" mobileText="Common questions" />
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
                  href="mailto:help@myshipos.com"
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
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center text-left focus:outline-none focus:ring-0 group py-2"
                    >
                      <span className={cn(
                        "text-base font-bold transition-colors pr-6 normal-case leading-snug",
                        isOpen ? "text-[#d75a34]" : "text-foreground group-hover:text-[#d75a34]"
                      )}>
                        {faq.question}
                      </span>
                      <ChevronDown className={cn(
                        "w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-all duration-300 flex-shrink-0",
                        isOpen ? "text-[#d75a34] rotate-180" : "group-hover:text-foreground"
                      )} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-2 pt-3 text-sm font-semibold text-muted-foreground/80 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic CTA */}
      <section className="py-24 px-6 lg:px-8 bg-transparent relative">
        <FadeIn>
          <div className="max-w-6xl mx-auto relative">
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.2] text-[#1c2024] dark:text-neutral-100 mb-6 max-w-4xl">
                Your content is ready. Your <br className="hidden sm:inline" /> audience is waiting. ShipOS ships it.
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg font-medium max-w-4xl mx-auto leading-relaxed mb-8">
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
              <Button
                onClick={() => navigate("/signup")}
                variant="marketing" size="lg" className="h-14 px-8 text-base tracking-wide group"
              >
                Try it for $0 (7-days) →
              </Button>

              <p className="text-xs text-muted-foreground font-medium mt-4">
                Evaluating options? Compare ShipOS to{" "}
                <a href="/compare/buffer" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">Buffer</a>
                {" "}or{" "}
                <a href="/compare/hootsuite" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">Hootsuite</a>
                {". "}See a full breakdown on the{" "}
                <a href="/ai-social-media-scheduler" className="text-[#d75a34] underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">AI social media scheduler page →</a>
              </p>

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
