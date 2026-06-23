import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { faqSchema, breadcrumbSchema, softwareApplicationSchema } from "@/lib/seo";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Smartphone,
  Monitor,
  User,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Globe,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  BookOpen,
  FileEdit,
  Sun,
  Moon,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link2,
  FileText,
  ImageIcon
} from "lucide-react";

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

// Predefined templates
const TEMPLATES = [
  {
    name: "The Story Framework",
    text: `I failed for 3 years straight.

Then, everything changed in 30 days.

Here is the exact framework I used to scale ShipOS from $0 to $10,000 MRR (and how you can replicate it starting today):

1. The Distribution First Rule
Stop building in isolation. Start talking. Launching is 20% of the game. Distribution is 80%.

2. The Hook-to-Body Ratio
If your first 3 lines don't hit, the rest of your post doesn't exist. Keep them under 140 characters.

3. Simple Premium Design
Visuals matter. Bold headlines and clean spacing build instant credibility.

Which rule are you implementing first?`
  },
  {
    name: "The Contradictory Hook",
    text: `Most creators get LinkedIn completely wrong.

They write long essays. Nobody has time for essays.

Here is how we generated 1.2M impressions in 14 days without spending a single dollar on ads:

• Hook: High tension, low word count.
• Spacing: Let the reader breathe (keep lines short).
• Value: Zero fluff, direct action steps.

Bookmark this post before writing your next hook.`
  },
  {
    name: "The Cheat Sheet",
    text: `The ultimate checklist for writing viral hooks:

❌ Bad: 'Here are some tips for SaaS builders...'
✅ Good: '90% of SaaS builders fail because of this 1 mistake.'

Your hook is your headline. If it fails, your post is dead.

Use this previewer to ensure your hook is NEVER cut off by the 'see more' button.`
  }
];

// Helper functions for Unicode Text formatting
const toUnicodeBold = (str: string): string => {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;
    
    // a-z: 97-122 -> Mathematical Sans-Serif Bold
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(code - 97 + 0x1D5EE);
    }
    // A-Z: 65-90 -> Mathematical Sans-Serif Bold
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(code - 65 + 0x1D5D4);
    }
    // 0-9: 48-57 -> Mathematical Sans-Serif Bold Numbers
    if (code >= 48 && code <= 57) {
      return String.fromCodePoint(code - 48 + 0x1D7EC);
    }
    return char;
  }).join('');
};

const toUnicodeItalic = (str: string): string => {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;
    
    // a-z: 97-122 -> Mathematical Sans-Serif Italic
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(code - 97 + 0x1D622);
    }
    // A-Z: 65-90 -> Mathematical Sans-Serif Italic
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(code - 65 + 0x1D608);
    }
    return char;
  }).join('');
};

export default function LinkedInPreviewer() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Post state
  const [text, setText] = useState(TEMPLATES[0].text);
  const [authorName, setAuthorName] = useState("Joel Pillar");
  const [authorHeadline, setAuthorHeadline] = useState("Founder @ ShipOS | Building the future of social automation");
  const [authorAvatar, setAuthorAvatar] = useState("/joel-pillar.jpg");
  
  // Custom interactive layout configurations
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [feedTheme, setFeedTheme] = useState<"light" | "dark">("light");
  const [attachmentType, setAttachmentType] = useState<"none" | "image" | "link" | "pdf">("none");
  
  // Media customization details
  const [customImageUrl, setCustomImageUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80");
  const [customLinkUrl, setCustomLinkUrl] = useState("https://myshipos.com");
  const [customLinkTitle, setCustomLinkTitle] = useState("ShipOS — 10x Your Social Velocity with Auto-Scheduling");
  const [pdfTitle, setPdfTitle] = useState("shipos-creator-playbook.pdf");
  const [pdfPageCount, setPdfPageCount] = useState(5);
  
  // Card see-more flags
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  // Action helpers
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const faqs = [
    {
      q: "Why does LinkedIn truncate post content?",
      a: "LinkedIn truncates posts to keep the user feed clean, readable, and compact. Long posts are collapsed behind the 'see more' button, encouraging readers to actively click if they want to read the entire post."
    },
    {
      q: "What is the exact character limit for the 'see more' cutoff?",
      a: "On Desktop, LinkedIn typically truncates text at 5 lines (approx 220-240 characters or fewer if there are empty lines). On Mobile, it cuts off at 3 lines (approx 140 characters). Any line break immediately counts as a full line, triggering truncation earlier."
    },
    {
      q: "Does this tool work for company pages or personal profiles?",
      a: "Yes, the truncation mechanics and layout rules are identical for both personal creator profiles and corporate LinkedIn company pages."
    },
    {
      q: "How does the 'see more' click affect post reach?",
      a: "Clicking 'see more' is considered a strong engagement signal by the LinkedIn feed algorithm. High click rates tell LinkedIn that your content is engaging, which causes it to show your post to a wider audience."
    }
  ];

  // Formatting Selection Handler
  const handleFormatSelection = (mode: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = text.substring(start, end);

    if (!selection) {
      toast({
        title: "No selection found",
        description: "Highlight a word or phrase in the editor first, then click format.",
      });
      return;
    }

    const formatted = mode === "bold" ? toUnicodeBold(selection) : toUnicodeItalic(selection);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + formatted + after;
    
    setText(newText);
    
    // Refocus and place cursor/selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 10);
  };

  // Helper insertion function (emojis, list characters)
  const handleInsertBullet = (bullet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText(prev => prev + bullet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + bullet + after;
    
    setText(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + bullet.length, start + bullet.length);
    }, 10);
  };

  // Line wrapping simulator
  const computeLines = (content: string, maxCharsPerLine: number): string[] => {
    const paragraphs = content.split("\n");
    const lines: string[] = [];
    
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        lines.push("");
      } else {
        const words = paragraph.split(" ");
        let currentLine = "";
        
        words.forEach((word) => {
          if ((currentLine + (currentLine ? " " : "") + word).length <= maxCharsPerLine) {
            currentLine = currentLine === "" ? word : currentLine + " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine !== "") {
          lines.push(currentLine);
        }
      }
    });
    
    return lines;
  };

  const desktopLines = computeLines(text, 92);
  const mobileLines = computeLines(text, 50);

  // Truncation statuses
  const desktopTruncated = desktopLines.length > 5;
  const mobileTruncated = mobileLines.length > 3;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Post copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setText("");
    setIsDesktopExpanded(false);
    setIsMobileExpanded(false);
  };

  const handleScheduleCTA = () => {
    if (text.trim()) {
      localStorage.setItem("shipos_pending_draft", text);
    }
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  // Character & word counters
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-20">
      <SEO
        title="Free LinkedIn Hook & 'See More' Previewer"
        description="Preview exactly how your LinkedIn posts truncate on mobile and desktop. Ensure your hooks capture attention before the 'see more' cutoff."
        path="/linkedin-hook-previewer"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/linkedin-hook-previewer" },
            { name: "LinkedIn Hook Previewer", path: "/linkedin-hook-previewer" }
          ]),
          faqSchema(
            faqs.map(f => ({
              question: f.q,
              answer: f.a
            }))
          ),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="flex-1 w-full py-12">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">


        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <SectionBadge label="Free Tool" text="Master your hook truncation" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            LinkedIn Hook Previewer
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Don't let the <strong className="text-foreground font-semibold">"see more"</strong> button kill your reach. Test your hooks on mobile and desktop layout simulators before posting.
          </p>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Inputs & Templates (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Template Selector */}
            <div className="border border-border bg-card text-card-foreground p-5 rounded-none shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold tracking-wider">Try Viral Templates</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setText(tpl.text);
                      setIsDesktopExpanded(false);
                      setIsMobileExpanded(false);
                    }}
                    className="text-left px-3 py-2 border border-border bg-muted/45 hover:bg-muted/80 dark:hover:bg-neutral-800 transition-colors rounded-none text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer truncate"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Text Editor with Toolbar */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-none shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h2 className="text-xs font-bold tracking-wider flex items-center gap-1.5">
                  <FileEdit className="w-4 h-4 text-muted-foreground" /> Write Your Post
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/60 text-xs text-muted-foreground select-none">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60 mr-2">Unicode formatting:</span>
                <button
                  type="button"
                  onClick={() => handleFormatSelection("bold")}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-bold text-foreground cursor-pointer transition-colors"
                  title="Make selected text bold"
                >
                  𝗕
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatSelection("italic")}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none italic text-foreground cursor-pointer transition-colors"
                  title="Make selected text italic"
                >
                  𝘐
                </button>

                <div className="w-[1px] h-4 bg-border/80 mx-1" />
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60 mr-2">Insert bullet:</span>
                {["•", "✅", "❌", "🚀", "💡", "📌", "✓"].map((bullet) => (
                  <button
                    key={bullet}
                    type="button"
                    onClick={() => handleInsertBullet(bullet + " ")}
                    className="w-6 h-6 flex items-center justify-center bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors"
                  >
                    {bullet}
                  </button>
                ))}
              </div>

              <Textarea
                ref={textareaRef}
                id="post-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your LinkedIn post draft here..."
                className="min-h-[280px] font-medium text-sm leading-relaxed border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50 resize-y p-4 bg-background"
              />

              {/* Counters */}
              <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                <div className="flex items-center gap-4">
                  <span>Characters: <strong className="text-foreground">{charCount}</strong></span>
                  <span>Words: <strong className="text-foreground">{wordCount}</strong></span>
                </div>
                
                {/* Visual Alert indicators */}
                <div className="flex items-center gap-3">
                  {desktopTruncated && (
                    <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-none">
                      Desktop Truncated
                    </div>
                  )}
                  {mobileTruncated && (
                    <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-none">
                      Mobile Truncated
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Profile Customizer */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-none shadow-sm space-y-4">
              <h2 className="text-xs font-bold tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
                <User className="w-4 h-4 text-muted-foreground" /> Customize Mock Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground">Author Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g. Joel Pillar"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground">Avatar URL (Optional)</label>
                  <Input
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground">Bio / Headline</label>
                  <Input
                    value={authorHeadline}
                    onChange={(e) => setAuthorHeadline(e.target.value)}
                    placeholder="Founder @ ShipOS | Social Media Expert"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Simulation Feed Card & CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Simulator Container */}
            <div className="border border-border bg-card text-card-foreground rounded-none shadow-sm overflow-hidden">
              {/* Tab Header Selector */}
              <div className="flex items-center justify-between border-b border-border bg-muted/10 pr-3">
                <div className="flex flex-1">
                  <button
                    onClick={() => setViewMode("desktop")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-widest border-r border-border cursor-pointer transition-all duration-200 ${
                      viewMode === "desktop"
                        ? "bg-background text-foreground border-b border-background"
                        : "text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-widest border-r border-border cursor-pointer transition-all duration-200 ${
                      viewMode === "mobile"
                        ? "bg-background text-foreground border-b border-background"
                        : "text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> Mobile
                  </button>
                </div>

                {/* Dark/Light mode simulated feed toggle */}
                <div className="flex items-center gap-1.5 pl-3">
                  <button
                    type="button"
                    onClick={() => setFeedTheme("light")}
                    className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
                      feedTheme === "light" 
                        ? "bg-[#d75a34]/15 border-[#d75a34] text-[#d75a34]" 
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title="LinkedIn Light Mode Preview"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedTheme("dark")}
                    className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
                      feedTheme === "dark" 
                        ? "bg-sky-500/15 border-sky-500 text-sky-400" 
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title="LinkedIn Dark Mode Preview"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Feed Card viewport emulator */}
              <div className={`p-4 sm:p-6 flex justify-center items-start min-h-[360px] transition-colors duration-200 ${
                feedTheme === "dark" ? "bg-neutral-950" : "bg-slate-50"
              }`}>
                {/* LinkedIn Card */}
                <div
                  className={`border shadow-sm rounded-none overflow-hidden transition-all duration-200 ${
                    viewMode === "mobile" ? "w-full max-w-[360px]" : "w-full max-w-[550px]"
                  } ${
                    feedTheme === "dark" 
                      ? "bg-[#1d2226] border-neutral-800 text-neutral-200" 
                      : "bg-white border-neutral-200 text-neutral-800"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 flex gap-3">
                    {/* Author Avatar image container */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-neutral-100 flex-shrink-0 flex items-center justify-center border-neutral-200 dark:border-neutral-700">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

                    {/* Author credentials */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold hover:underline cursor-pointer ${
                          feedTheme === "dark" ? "text-neutral-100 hover:text-sky-400" : "text-neutral-900 hover:text-[#0A66C2]"
                        }`}>
                          {authorName || "Your Name"}
                        </span>
                        <button className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        feedTheme === "dark" ? "text-neutral-400" : "text-neutral-500"
                      }`}>
                        {authorHeadline || "Your Bio Headline goes here"}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
                        <span>1h</span>
                        <span>•</span>
                        <span>Edited</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    </div>
                  </div>

                  {/* Card Post Content */}
                  <div className="px-4 pb-4">
                    <div className="text-sm leading-normal whitespace-pre-wrap font-sans break-words">
                      {viewMode === "desktop" ? (
                        isDesktopExpanded || !desktopTruncated ? (
                          text
                        ) : (
                          <>
                            {computeLines(text, 92).slice(0, 5).join("\n")}
                            {" "}
                            <button
                              onClick={() => setIsDesktopExpanded(true)}
                              className="text-neutral-500 dark:text-neutral-400 hover:text-[#0A66C2] dark:hover:text-sky-400 font-bold hover:underline ml-1 inline-block"
                            >
                              ...see more
                            </button>
                          </>
                        )
                      ) : (
                        isMobileExpanded || !mobileTruncated ? (
                          text
                        ) : (
                          <>
                            {computeLines(text, 50).slice(0, 3).join("\n")}
                            {" "}
                            <button
                              onClick={() => setIsMobileExpanded(true)}
                              className="text-neutral-500 dark:text-neutral-400 hover:text-[#0A66C2] dark:hover:text-sky-400 font-bold hover:underline ml-1 inline-block"
                            >
                              ...see more
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  {/* Interactive Mock Attachment rendering */}
                  {attachmentType === "image" && (
                    <div className={`border-t ${feedTheme === "dark" ? "border-neutral-800" : "border-neutral-200"}`}>
                      <img src={customImageUrl} alt="Mock attachment" className="w-full aspect-video object-cover" />
                    </div>
                  )}

                  {attachmentType === "link" && (
                    <div className={`border-t ${feedTheme === "dark" ? "border-neutral-800" : "border-neutral-200"}`}>
                      <div className={`border-y ${
                        feedTheme === "dark" ? "bg-[#1f2429] border-neutral-800" : "bg-[#f3f6f8] border-neutral-200"
                      }`}>
                        <img src={customImageUrl} alt="Link cover" className="w-full aspect-[1.91/1] object-cover" />
                        <div className="p-3">
                          <span className="text-[10px] text-neutral-500 tracking-wider block font-bold uppercase">MYSHIPOS.COM</span>
                          <span className={`text-sm font-bold line-clamp-1 mt-0.5 ${
                            feedTheme === "dark" ? "text-neutral-100" : "text-neutral-800"
                          }`}>{customLinkTitle}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {attachmentType === "pdf" && (
                    <div className={`border-t p-4 flex flex-col items-center text-center gap-3 ${
                      feedTheme === "dark" ? "border-neutral-800 bg-[#293138]" : "border-neutral-200 bg-[#f3f6f8]"
                    }`}>
                      <div className="w-12 h-14 bg-rose-500/10 text-rose-500 flex flex-col items-center justify-center border border-rose-500/20 rounded-none shrink-0 font-black text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="text-xs font-bold line-clamp-1 text-foreground">{pdfTitle}</span>
                        <span className="text-[10px] text-neutral-500 mt-1 block font-medium">{pdfPageCount} pages</span>
                      </div>
                      <div className="flex gap-2 items-center text-[10px] bg-background border border-border px-3 py-1 font-bold select-none text-muted-foreground">
                        <span>Page 1 of {pdfPageCount}</span>
                      </div>
                    </div>
                  )}

                  {/* Interactive card feed footer */}
                  <div className={`border-t px-2 py-1 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 ${
                    feedTheme === "dark" ? "border-neutral-800" : "border-neutral-100"
                  }`}>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-none transition-colors cursor-pointer">
                      <ThumbsUp className="w-4 h-4" /> Like
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-none transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" /> Comment
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-none transition-colors cursor-pointer">
                      <Repeat2 className="w-4 h-4" /> Repost
                    </button>
                    <button className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-none transition-colors cursor-pointer">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed attachments type selector */}
              <div className="p-4 border-t border-border bg-muted/10 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview Attachment Media:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "none", label: "Text Only" },
                    { id: "image", label: "Image" },
                    { id: "link", label: "Link Card" },
                    { id: "pdf", label: "PDF Slide" }
                  ].map((att) => (
                    <button
                      key={att.id}
                      onClick={() => setAttachmentType(att.id as any)}
                      className={`py-1.5 text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer rounded-none ${
                        attachmentType === att.id 
                          ? "bg-primary border-primary text-white" 
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {att.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible details depending on selected media */}
              {attachmentType !== "none" && (
                <div className="p-4 border-t border-border bg-muted/5 space-y-3">
                  {attachmentType === "image" && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Image URL</label>
                      <Input
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="h-8 text-xs rounded-none bg-background"
                      />
                    </div>
                  )}
                  {attachmentType === "link" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Image Cover URL</label>
                        <Input
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          className="h-8 text-xs rounded-none bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Link Headline</label>
                        <Input
                          value={customLinkTitle}
                          onChange={(e) => setCustomLinkTitle(e.target.value)}
                          className="h-8 text-xs rounded-none bg-background"
                        />
                      </div>
                    </div>
                  )}
                  {attachmentType === "pdf" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Document Name</label>
                        <Input
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          className="h-8 text-xs rounded-none bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Page Count</label>
                        <Input
                          type="number"
                          value={pdfPageCount}
                          onChange={(e) => setPdfPageCount(Number(e.target.value))}
                          className="h-8 text-xs rounded-none bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions (Copy text) */}
            <div className="flex gap-4">
              <Button
                onClick={handleCopy}
                className="flex-1 h-12 bg-background border border-border hover:bg-muted/50 text-foreground font-bold uppercase tracking-widest text-xs rounded-none shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500 animate-bounce" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Post Text"}
              </Button>
            </div>

            {/* Sticky Lead-Gen CTA box */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-none shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 rounded-none">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider leading-tight">Looks Good? Auto-Schedule It</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-0.5">Publish instantly to LinkedIn, X, & more.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Compose once and distribute this post across X (Twitter), LinkedIn, Instagram, TikTok, Threads, and Bluesky. Set your custom schedule slots and let ShipOS auto-pilot your audience growth.
              </p>
              <Button
                onClick={handleScheduleCTA}
                disabled={!text.trim()}
                className="w-full h-11 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold uppercase tracking-widest text-[10px] rounded-none shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
              >
                Auto-Schedule This Post <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 mt-16 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <SectionBadge label="How It Works" text="Master your hook truncation" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How to Use the LinkedIn Hook Previewer
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-extrabold rounded-none">
                1
              </div>
              <h4 className="text-base sm:text-lg font-bold text-foreground">Write or Paste Post</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Paste your post text or choose one of our high-converting templates to get a starting point.
              </p>
            </div>
            <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-extrabold rounded-none">
                2
              </div>
              <h4 className="text-base sm:text-lg font-bold text-foreground">Check Truncation Limits</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Toggle between Mobile (3 lines) and Desktop (5 lines) to see where the "see more" cutoff will truncate your hook.
              </p>
            </div>
            <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] text-[#d75a34] flex items-center justify-center mx-auto text-lg font-extrabold rounded-none">
                3
              </div>
              <h4 className="text-base sm:text-lg font-bold text-foreground">Copy & Schedule</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Copy your post text instantly, or auto-schedule it with ShipOS across LinkedIn, Twitter, and other networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benchmarks / Tips Section */}
      <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <SectionBadge label="Best Practices" text="Write high-performing hooks" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Optimizing Your LinkedIn Reach
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                The Science Behind the "See More" Button
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LinkedIn's feed algorithm heavily measures "dwell time" (how long a user spends viewing a post) and active clicks. Clicking the "...see more" link is considered a strong engagement signal, triggering immediate additional distribution.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If your hook is weak and gets cut off in a confusing place, readers will simply scroll past. Your hook is the single most critical factor in your content distribution strategy.
              </p>
            </div>
            <div className="border border-border bg-card p-8 rounded-none shadow-sm space-y-4">
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Optimal Hook Formatting Rules
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                  <span><strong>Short and Punchy:</strong> Aim for less than 100 characters on line 1 for immediate impact.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                  <span><strong>Mind the whitespace:</strong> Use single-line returns to separate ideas. Blank lines count toward the 5-line desktop / 3-line mobile limits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#d75a34] font-bold text-base select-none leading-none">✓</span>
                  <span><strong>Spark Curiosity:</strong> State a contrarian take, ask a bold question, or share an impressive result to force readers to read more.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-16">
          <div>
            <div className="flex flex-col items-center text-center mb-12">
              <SectionBadge label="FAQ" text="Frequently Asked Questions" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border/60">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                  >
                    <span className="text-base font-bold text-foreground group-hover:text-[#d75a34] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-[#d75a34] text-lg font-bold ml-4">
                      {openFaqIndex === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaqIndex === i && (
                    <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Platform Demo Video Section */}
      <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d75a34]/10 border border-[#d75a34]/20 text-[#d75a34] text-xs font-bold uppercase tracking-wider rounded-none">
              <Sparkles className="w-3.5 h-3.5" /> Product Demo
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              See ShipOS in Action
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Watch how ShipOS simplifies planning, scheduling, and publishing across all your social platforms from a single dashboard.
            </p>
          </div>

          <div 
            onClick={isPlayingDemo ? undefined : () => setIsPlayingDemo(true)}
            className={cn(
              "relative w-full aspect-video bg-[#fbf4f2] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] flex items-center justify-center group overflow-hidden rounded-none mx-auto",
              !isPlayingDemo && "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
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
                
                {/* Thumbnail Image */}
                <img 
                  src="https://img.youtube.com/vi/huwiFpCP614/maxresdefault.jpg" 
                  alt="ShipOS Platform Demo Preview" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Dark overlay for readability and premium feel */}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/35">
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
        </div>
      </section>

      {/* Grow with ShipOS Banner */}
      <section className="bg-[#FAF7F5] dark:bg-background border-t border-b border-border/40 py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-14">
            <SectionBadge label="Grow" text="Supercharge your social presence" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Grow with ShipOS
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Stop previewing, start publishing. ShipOS auto-schedules your best content across LinkedIn, X, Instagram, TikTok, Threads, and Bluesky — all from one workspace.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={cn("text-xs font-bold tracking-widest transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary rounded-none"
            />
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold tracking-widest transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                Annual
              </span>
              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-none shadow-sm">
                Save 20%
              </Badge>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const price = isAnnual ? plan.price.annual : plan.price.monthly;
              const periodLabel = isAnnual ? "/year" : "/month";
              return (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative border-border bg-card shadow-none rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full",
                    plan.popular ? "ring-2 ring-primary bg-primary/[0.02]" : "hover:border-primary/30",
                  )}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-[10px] font-bold tracking-widest py-1 px-4 rounded-none">
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-base font-bold tracking-widest text-muted-foreground">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1 mb-2 mt-4">
                      <span className="text-4xl font-bold text-foreground tracking-tighter">${price}</span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{periodLabel}</span>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-6 space-y-8 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-muted-foreground tracking-wider">Includes Features:</p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleScheduleCTA}
                      className={cn(
                        "w-full h-12 font-bold tracking-widest text-[10px] rounded-none shadow-none transition-all",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-background text-foreground border border-border hover:bg-muted",
                      )}
                    >
                      Start 7-Day Trial
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Guarantee strip */}
          <div className="flex items-center justify-center gap-3 mt-10 text-muted-foreground">
            <Check className="w-4 h-4" />
            <p className="text-[10px] font-bold tracking-[0.15em]">
              Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 px-6 lg:px-8 bg-background relative z-10">
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
              {[
                { bg: "bg-[#0077B5]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>, name: "LinkedIn" },
                { bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, name: "Instagram" },
                { bg: "bg-[#1877F2]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, name: "Facebook" },
                { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, name: "Twitter" },
                { bg: "bg-[#FF0000]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, name: "YouTube" },
                { bg: "bg-[#101010]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>, name: "Threads" },
                { bg: "bg-[#BD081C]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.12.115.226.085.345-.093.389-.301 1.224-.341 1.391-.054.221-.179.268-.413.16-1.545-.719-2.51-2.977-2.51-4.793 0-3.902 2.836-7.487 8.174-7.487 4.293 0 7.629 3.059 7.629 7.148 0 4.265-2.689 7.697-6.422 7.697-1.254 0-2.435-.651-2.839-1.42l-.772 2.94c-.28 1.066-1.037 2.403-1.542 3.226C8.854 23.834 10.373 24 12 24c6.63 0 12-5.373 12-12S18.63 0 12 0z"/></svg>, name: "Pinterest" },
                { bg: "bg-[#0285FF]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 320 286"><path d="M69.364 19.146c36.687 27.806 76.147 84.186 90.636 114.439 14.489-30.253 53.949-86.633 90.636-114.439C277.126-.453 320-16.446 320 34.908c0 10.362-2.182 45.474-5.32 57.062-7.591 28.058-39.027 34.61-68.514 29.544 48.163 12.28 63.856 46.104 29.544 76.16-30.706 26.892-74.996 16.273-115.71 16.273-40.714 0-85.004 10.619-115.71-16.273-34.312-30.056-18.619-63.88 29.544-76.16-29.487 5.066-60.923-1.486-68.514-29.544C2.182 80.382 0 45.27 0 34.908 0-16.446 42.874-.453 69.364 19.146Z"/></svg>, name: "Bluesky" },
                { bg: "bg-[#010101]", icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, name: "TikTok" },
              ].map((badge) => (
                <div key={badge.name} title={badge.name} className="transition-transform duration-200 hover:scale-110 shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-none flex items-center justify-center shadow-sm border border-black/5 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-300",
                      badge.bg
                    )}
                  >
                    {badge.icon}
                  </div>
                </div>
              ))}
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
      </section>
    </main>

      <Footer />
    </div>
  );
}
