import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { faqSchema, breadcrumbSchema } from "@/lib/seo";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Post state
  const [text, setText] = useState(TEMPLATES[0].text);
  const [authorName, setAuthorName] = useState("Alex Rivers");
  const [authorHeadline, setAuthorHeadline] = useState("Founder @ ShipOS | Building the future of social automation");
  const [authorAvatar, setAuthorAvatar] = useState("");
  
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

  const desktopTruncated = desktopLines.length > 5;
  const mobileTruncated = mobileLines.length > 3;

  // Real-time Hook Diagnostics & Analytical Score
  const firstLine = desktopLines[0] || "";
  const firstLineLength = firstLine.length;
  
  // Score rule 1: Hook length
  let ruleHookStatus: "success" | "warning" | "error" = "success";
  let ruleHookFeedback = "Optimal first line length (under 80 characters)";
  if (firstLineLength > 100) {
    ruleHookStatus = "error";
    ruleHookFeedback = `First line is too long (${firstLineLength} chars). It will wrap and truncate early.`;
  } else if (firstLineLength > 80) {
    ruleHookStatus = "warning";
    ruleHookFeedback = `First line is slightly long (${firstLineLength} chars). Keep it under 80 for mobile safety.`;
  } else if (firstLineLength === 0) {
    ruleHookStatus = "error";
    ruleHookFeedback = "Your post has no content or starts with a blank line.";
  }

  // Score rule 2: Space spacer
  const allSplitLines = text.split("\n");
  const isSecondLineEmpty = allSplitLines.length > 1 && allSplitLines[1].trim() === "";
  const ruleSpaceStatus = isSecondLineEmpty ? "success" : "error";
  const ruleSpaceFeedback = isSecondLineEmpty
    ? "Line 2 is empty (provides visual breathing room in feed)"
    : "Line 2 contains text. Leave it blank to build curiosity and a clean cutoff.";

  // Score rule 3: Power click-trigger words
  const powerWords = ["fail", "free", "secret", "how to", "exactly", "framework", "rules", "checklist", "%", "$", "mistake", "viral", "scale", "lesson", "system", "grow", "stop", "never", "always"];
  const lowerText = text.toLowerCase();
  const matchedPowerWords = powerWords.filter(word => lowerText.includes(word));
  const rulePowerStatus = matchedPowerWords.length >= 2 ? "success" : (matchedPowerWords.length === 1 ? "warning" : "error");
  const rulePowerFeedback = matchedPowerWords.length >= 2
    ? `Uses ${matchedPowerWords.length} click-trigger words (${matchedPowerWords.slice(0, 3).join(", ")})`
    : (matchedPowerWords.length === 1 
      ? `Uses 1 click-trigger word (${matchedPowerWords[0]}). Try adding another one.` 
      : "No curiosity power words detected (e.g. secret, mistake, fail, system).");

  // Score rule 4: Formatting bullet lists
  const hasFormattingBullets = text.includes("•") || text.includes("- ") || text.includes("✅") || text.includes("❌") || text.includes("1.") || text.includes("★") || text.includes("✓");
  const ruleBulletStatus = hasFormattingBullets ? "success" : "warning";
  const ruleBulletFeedback = hasFormattingBullets
    ? "Uses formatting structures (bullets/lists) to increase feed dwell time"
    : "No list bullets or checkmarks found. Consider using them for structural readability.";

  // Score rule 5: Final CTA or question
  const hasCallToAction = text.includes("?") || lowerText.includes("comment") || lowerText.includes("below") || lowerText.includes("link") || lowerText.includes("agree") || lowerText.includes("repost");
  const ruleCtaStatus = hasCallToAction ? "success" : "warning";
  const ruleCtaFeedback = hasCallToAction
    ? "Clear CTA or hook question detected at the end of the post"
    : "No ending question or call to action (repost, comment, link) detected.";

  // Calculate score out of 100
  let hookScore = 40;
  if (firstLineLength > 0 && firstLineLength <= 60) hookScore += 20;
  else if (firstLineLength > 60 && firstLineLength <= 80) hookScore += 15;
  else if (firstLineLength > 80 && firstLineLength <= 100) hookScore += 5;
  
  if (isSecondLineEmpty) hookScore += 20;
  
  if (matchedPowerWords.length >= 2) hookScore += 15;
  else if (matchedPowerWords.length === 1) hookScore += 8;
  
  if (hasFormattingBullets) hookScore += 10;
  if (hasCallToAction) hookScore += 15;

  if (text.trim() === "") hookScore = 0;

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
      toast({
        title: "Draft Saved!",
        description: "We've saved your post. Redirecting to signup...",
      });
    }
    navigate("/signup?ref=linkedin-previewer");
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
          )
        ]}
      />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 mb-6 select-none">
          <a href="/" className="hover:text-[#d75a34] transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <span className="text-muted-foreground/60">Free Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <span className="text-foreground font-bold">LinkedIn Hook Previewer</span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d75a34]/10 border border-[#d75a34]/20 text-[#d75a34] text-xs font-bold uppercase tracking-wider rounded-none">
            <Sparkles className="w-3.5 h-3.5" /> Free Growth Tool
          </div>
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
                <h3 className="text-xs font-bold uppercase tracking-wider">Try Viral Templates</h3>
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
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mr-2">Unicode formatting:</span>
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mr-2">Insert bullet:</span>
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

            {/* Hook Analysis & Score Panel */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-none shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
                <Sparkles className="w-4 h-4 text-primary" /> Hook Analysis & Viral Score
              </h2>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-muted/40 border border-border/80">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                  <div className="text-3xl font-black text-foreground mt-1 flex items-baseline">
                    <span className={hookScore >= 75 ? "text-emerald-500" : hookScore >= 50 ? "text-amber-500" : "text-rose-500"}>{hookScore}</span>
                    <span className="text-xs text-muted-foreground font-normal">/100</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="h-2.5 bg-neutral-200 dark:bg-neutral-800 w-full relative">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        hookScore >= 75 ? "bg-emerald-500" : hookScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${hookScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {hookScore >= 75 
                      ? "Excellent! Your hook is highly optimized for feed clicks and algorithmic reach." 
                      : hookScore >= 50 
                        ? "Good hook potential, but checking formatting checklist recommendations will yield better results." 
                        : "Weak hook representation. Check the checklist below to optimize readability."}
                  </p>
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-3.5 text-xs">
                {/* Rule 1 */}
                <div className="flex items-start gap-2.5">
                  {ruleHookStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : ruleHookStatus === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Hook Line Length:</span>
                    <span className="text-muted-foreground font-medium block mt-0.5">{ruleHookFeedback}</span>
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="flex items-start gap-2.5">
                  {ruleSpaceStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Line 2 Spacing:</span>
                    <span className="text-muted-foreground font-medium block mt-0.5">{ruleSpaceFeedback}</span>
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="flex items-start gap-2.5">
                  {rulePowerStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : rulePowerStatus === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Curiosity & Trigger Words:</span>
                    <span className="text-muted-foreground font-medium block mt-0.5">{rulePowerFeedback}</span>
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="flex items-start gap-2.5">
                  {ruleBulletStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Structural bullet lists:</span>
                    <span className="text-muted-foreground font-medium block mt-0.5">{ruleBulletFeedback}</span>
                  </div>
                </div>

                {/* Rule 5 */}
                <div className="flex items-start gap-2.5">
                  {ruleCtaStatus === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Call to Action (CTA):</span>
                    <span className="text-muted-foreground font-medium block mt-0.5">{ruleCtaFeedback}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Customizer */}
            <div className="border border-border bg-card text-card-foreground p-6 rounded-none shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
                <User className="w-4 h-4 text-muted-foreground" /> Customize Mock Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Author Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g. Alex Rivers"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avatar URL (Optional)</label>
                  <Input
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio / Headline</label>
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
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest border-r border-border cursor-pointer transition-all duration-200 ${
                      viewMode === "desktop"
                        ? "bg-background text-foreground border-b border-background"
                        : "text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest border-r border-border cursor-pointer transition-all duration-200 ${
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
                  <h4 className="text-xs font-bold uppercase tracking-wider leading-tight">Looks Good? Auto-Schedule It</h4>
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

        {/* Spacer */}
        <div className="h-16" />

        {/* How It Works Section - direct rendering without border frame */}
        <div className="space-y-8 max-w-5xl mx-auto py-8">
          <h2 className="text-2xl font-black uppercase tracking-wider text-center text-foreground">
            How to Use the LinkedIn Hook Previewer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-[#d75a34] flex items-center justify-center mx-auto text-base font-black rounded-none">
                1
              </div>
              <h4 className="text-sm font-bold uppercase text-foreground">Write or Paste Post</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste your post text or choose one of our high-converting templates to get a starting point.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-[#d75a34] flex items-center justify-center mx-auto text-base font-black rounded-none">
                2
              </div>
              <h4 className="text-sm font-bold uppercase text-foreground">Check Truncation Limits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toggle between Mobile (3 lines) and Desktop (5 lines) to see where the "see more" cutoff will truncate your hook.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-[#d75a34] flex items-center justify-center mx-auto text-base font-black rounded-none">
                3
              </div>
              <h4 className="text-sm font-bold uppercase text-foreground">Copy & Schedule</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Copy your post text instantly, or auto-schedule it with ShipOS across LinkedIn, Twitter, and other networks.
              </p>
            </div>
          </div>
        </div>

        {/* Benchmarks / Tips Section - border line break without heavy boxed cards */}
        <div className="max-w-5xl mx-auto py-10 border-t border-border/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wide text-foreground">
                The Science Behind the "See More" Button
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LinkedIn's feed algorithm heavily measures "dwell time" (how long a user spends viewing a post) and active clicks. Clicking the "...see more" link is considered a strong engagement signal, triggering immediate additional distribution.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If your hook is weak and gets cut off in a confusing place, readers will simply scroll past. Your hook is the single most critical factor in your content distribution strategy.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wide text-foreground">
                Optimal Hook Formatting Rules
              </h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">✓</span>
                  <span><strong>Short and Punchy:</strong> Aim for less than 100 characters on line 1 for immediate impact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">✓</span>
                  <span><strong>Mind the whitespace:</strong> Use single-line returns to separate ideas. Blank lines count toward the 5-line desktop / 3-line mobile limits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d75a34] font-bold">✓</span>
                  <span><strong>Spark Curiosity:</strong> State a contrarian take, ask a bold question, or share an impressive result to force readers to read more.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section - rendering direct answers on page bg without enclosing card */}
        <div className="max-w-4xl mx-auto py-10 border-t border-border/60 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-wider text-center text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border/60 pb-3">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-3 text-xs font-bold text-left hover:text-[#d75a34] transition-colors cursor-pointer"
                >
                  <span className="text-foreground">{faq.q}</span>
                  <span className="text-primary text-base font-extrabold">{openFaqIndex === i ? "−" : "+"}</span>
                </button>
                {openFaqIndex === i && (
                  <div className="pb-3 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-8" />

        {/* Full-Width Conversion CTA Banner */}
        <div className="border border-border bg-[#d75a34]/5 dark:bg-[#d75a34]/5 p-8 rounded-none text-center space-y-6 max-w-4xl mx-auto">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-xl font-black uppercase tracking-wider text-foreground">
              Ready to automate your social schedule?
            </h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Don't just preview hooks. Set up automatic posting queues across LinkedIn, X (Twitter), Instagram, Threads, and Bluesky in one central workspace. Try ShipOS for free today.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleScheduleCTA}
              className="h-11 px-8 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-black uppercase tracking-widest text-[10px] rounded-none border border-border shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Start Free Trial Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
