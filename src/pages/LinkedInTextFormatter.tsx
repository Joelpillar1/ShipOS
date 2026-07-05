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
import { cn } from "@/lib/utils";
import { FreeToolFinalCta } from "@/components/FreeToolFinalCta";
import { FreeToolPricingSection } from "@/components/FreeToolPricingSection";
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
  Info,
  Type,
  Maximize2,
  ChevronRight
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

const TEMPLATES = [
  {
    name: "Story Telling",
    text: "I was rejected by 42 investors.\n\nThen, everything clicked in one week.\n\nHere is the exact story of how we launched ShipOS and why distribution matters more than building in isolation:"
  },
  {
    name: "Contrarian Hook",
    text: "Most startup founders are building the wrong product.\n\nThey think coding is the hard part. It's not. Getting customers is.\n\nHere are 3 hard truths about growing a SaaS product today:"
  },
  {
    name: "The Playbook",
    text: "FREE PLAYBOOK: How to grow your LinkedIn audience to 20k followers in 2026.\n\nNo hacks. No pods. Just high-value, structured posts.\n\nReply with 'SEND' and I'll DM it to you instantly (must be following)."
  }
];

// Helper functions for Unicode Text formatting
const mapChar = (char: string, style: string): string => {
  const code = char.codePointAt(0);
  if (!code) return char;

  switch (style) {
    case "bold-sans":
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D5EE);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D5D4);
      if (code >= 48 && code <= 57) return String.fromCodePoint(code - 48 + 0x1D7EC);
      break;
    case "italic-sans":
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D622);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D608);
      break;
    case "bold-serif":
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D41A);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D400);
      if (code >= 48 && code <= 57) return String.fromCodePoint(code - 48 + 0x1D7CE);
      break;
    case "italic-serif":
      if (char === 'h') return '\u210E';
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D44E);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D434);
      break;
    case "bold-italic-serif":
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D482);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D468);
      break;
    case "monospace":
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D68A);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D670);
      if (code >= 48 && code <= 57) return String.fromCodePoint(code - 48 + 0x1D7F6);
      break;
    case "script":
      const scriptUpper = ["\uD835\uDC9C", "\u212C", "\uD835\uDC9E", "\uD835\uDC9F", "\u2130", "\u2131", "\uD835\uDCA2", "\u210B", "\u2110", "\uD835\uDCA5", "\uD835\uDCA6", "\u2112", "\u2133", "\uD835\uDCA9", "\uD835\uDCAA", "\uD835\uDCAB", "\uD835\uDCAC", "\u211B", "\uD835\uDCAE", "\uD835\uDCAF", "\uD835\uDCB0", "\uD835\uDCB1", "\uD835\uDCB2", "\uD835\uDCB3", "\uD835\uDCB4", "\uD835\uDCB5"];
      const scriptLower = ["\uD835\uDCB6", "\uD835\uDCB7", "\uD835\uDCB8", "\uD835\uDCB9", "\u212F", "\uD835\uDCBB", "\u210A", "\uD835\uDCBD", "\uD835\uDCBE", "\uD835\uDCBF", "\uD835\uDCC0", "\uD835\uDCC1", "\uD835\uDCC2", "\uD835\uDCC3", "\u2134", "\uD835\uDCC5", "\uD835\uDCC6", "\uD835\uDCC7", "\uD835\uDCC8", "\uD835\uDCC9", "\uD835\uDCCA", "\uD835\uDCCB", "\uD835\uDCCC", "\uD835\uDCCD", "\uD835\uDCCE", "\uD835\uDCCF"];
      if (code >= 65 && code <= 90) return scriptUpper[code - 65];
      if (code >= 97 && code <= 122) return scriptLower[code - 97];
      break;
    case "double-struck":
      const dsUpper = ["\uD835\uDD38", "\uD835\uDD39", "\u2102", "\uD835\uDD3B", "\uD835\uDD3C", "\uD835\uDD3D", "\uD835\uDD3E", "\u210D", "\uD835\uDD40", "\uD835\uDD41", "\uD835\uDD42", "\uD835\uDD43", "\uD835\uDD44", "\u2115", "\uD835\uDD46", "\u2119", "\u211A", "\u211D", "\uD835\uDD4A", "\uD835\uDD4B", "\uD835\uDD4C", "\uD835\uDD4D", "\uD835\uDD4E", "\uD835\uDD4F", "\uD835\uDD50", "\u2124"];
      if (code >= 65 && code <= 90) return dsUpper[code - 65];
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D552);
      if (code >= 48 && code <= 57) return String.fromCodePoint(code - 48 + 0x1D7D8);
      break;
    case "strikethrough":
      return char + "\u0336";
    case "underline":
      return char + "\u0332";
    default:
      break;
  }
  return char;
};

const convertText = (str: string, style: string): string => {
  if (style === "strikethrough" || style === "underline") {
    return Array.from(str).map(char => mapChar(char, style)).join('');
  }
  return Array.from(str).map(char => mapChar(char, style)).join('');
};

const stripUnicodeFormatting = (str: string): string => {
  return Array.from(str).map(char => {
    const code = char.codePointAt(0);
    if (!code) return char;

    if (code >= 0x1D5D4 && code <= 0x1D5ED) return String.fromCodePoint(code - 0x1D5D4 + 65);
    if (code >= 0x1D5EE && code <= 0x1D607) return String.fromCodePoint(code - 0x1D5EE + 97);
    if (code >= 0x1D7EC && code <= 0x1D7F5) return String.fromCodePoint(code - 0x1D7EC + 48);

    if (code >= 0x1D608 && code <= 0x1D621) return String.fromCodePoint(code - 0x1D608 + 65);
    if (code >= 0x1D622 && code <= 0x1D63B) return String.fromCodePoint(code - 0x1D622 + 97);

    if (code >= 0x1D400 && code <= 0x1D419) return String.fromCodePoint(code - 0x1D400 + 65);
    if (code >= 0x1D41A && code <= 0x1D433) return String.fromCodePoint(code - 0x1D41A + 97);
    if (code >= 0x1D7CE && code <= 0x1D7D7) return String.fromCodePoint(code - 0x1D7CE + 48);

    if (code >= 0x1D434 && code <= 0x1D44D) return String.fromCodePoint(code - 0x1D434 + 65);
    if (code >= 0x1D44E && code <= 0x1D467) return String.fromCodePoint(code - 0x1D44E + 97);
    if (code === 0x210E) return 'h';

    if (code >= 0x1D468 && code <= 0x1D481) return String.fromCodePoint(code - 0x1D468 + 65);
    if (code >= 0x1D482 && code <= 0x1D49B) return String.fromCodePoint(code - 0x1D482 + 97);

    if (code >= 0x1D670 && code <= 0x1D689) return String.fromCodePoint(code - 0x1D670 + 65);
    if (code >= 0x1D68A && code <= 0x1D6A3) return String.fromCodePoint(code - 0x1D68A + 97);
    if (code >= 0x1D7F6 && code <= 0x1D7FF) return String.fromCodePoint(code - 0x1D7F6 + 48);

    const scriptUpper = ["\uD835\uDC9C", "\u212C", "\uD835\uDC9E", "\uD835\uDC9F", "\u2130", "\u2131", "\uD835\uDCA2", "\u210B", "\u2110", "\uD835\uDCA5", "\uD835\uDCA6", "\u2112", "\u2133", "\uD835\uDCA9", "\uD835\uDCAA", "\uD835\uDCAB", "\uD835\uDCAC", "\u211B", "\uD835\uDCAE", "\uD835\uDCAF", "\uD835\uDCB0", "\uD835\uDCB1", "\uD835\uDCB2", "\uD835\uDCB3", "\uD835\uDCB4", "\uD835\uDCB5"];
    const scriptLower = ["\uD835\uDCB6", "\uD835\uDCB7", "\uD835\uDCB8", "\uD835\uDCB9", "\u212F", "\uD835\uDCBB", "\u210A", "\uD835\uDCBD", "\uD835\uDCBE", "\uD835\uDCBF", "\uD835\uDCC0", "\uD835\uDCC1", "\uD835\uDCC2", "\uD835\uDCC3", "\u2134", "\uD835\uDCC5", "\uD835\uDCC6", "\uD835\uDCC7", "\uD835\uDCC8", "\uD835\uDCC9", "\uD835\uDCCA", "\uD835\uDCCB", "\uD835\uDCCC", "\uD835\uDCCD", "\uD835\uDCCE", "\uD835\uDCCF"];
    if (scriptUpper.includes(char)) return String.fromCharCode(65 + scriptUpper.indexOf(char));
    if (scriptLower.includes(char)) return String.fromCharCode(97 + scriptLower.indexOf(char));

    const dsUpper = ["\uD835\uDD38", "\uD835\uDD39", "\u2102", "\uD835\uDD3B", "\uD835\uDD3C", "\uD835\uDD3D", "\uD835\uDD3E", "\u210D", "\uD835\uDD40", "\uD835\uDD41", "\uD835\uDD42", "\uD835\uDD43", "\uD835\uDD44", "\u2115", "\uD835\uDD46", "\u2119", "\u211A", "\u211D", "\uD835\uDD4A", "\uD835\uDD4B", "\uD835\uDD4C", "\uD835\uDD4D", "\uD835\uDD4E", "\uD835\uDD4F", "\uD835\uDD50", "\u2124"];
    if (dsUpper.includes(char)) return String.fromCharCode(65 + dsUpper.indexOf(char));
    if (code >= 0x1D552 && code <= 0x1D56B) return String.fromCodePoint(code - 0x1D552 + 97);
    if (code >= 0x1D7D8 && code <= 0x1D7E1) return String.fromCodePoint(code - 0x1D7D8 + 48);

    if (char === '\u0336' || char === '\u0332') return "";

    return char;
  }).join('');
};

export default function LinkedInTextFormatter() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Post editor states
  const [text, setText] = useState(TEMPLATES[0].text);
  const [authorName, setAuthorName] = useState("Joel Pillar");
  const [authorHeadline, setAuthorHeadline] = useState("Founder @ ShipOS | Building the future of social automation");
  const [authorAvatar, setAuthorAvatar] = useState("/joel-pillar.jpg");

  // Simulated feed state
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [feedTheme, setFeedTheme] = useState<"light" | "dark">("light");
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // General utility states
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const faqs = [
    {
      q: "Does LinkedIn support native bold or italic text formatting?",
      a: "No, the official LinkedIn text composer does not have text formatting options. This tool translates standard alphanumeric characters into mathematical Unicode symbols that mimic formatting and display on the platform."
    },
    {
      q: "Will my formatted text show up correctly for everyone?",
      a: "Yes, modern smartphones, tablets, and desktop operating systems have native support for mathematical Unicode blocks. Very old operating systems or specific screen readers might not fully read it, so it's best to format keywords, headlines, and hooks rather than your entire post."
    },
    {
      q: "Is text formatting safe for the LinkedIn algorithm?",
      a: "Absolutely. Using Unicode formatting does not violate LinkedIn terms. In fact, bold hooks and styled bullet points often improve readability and click-through rates on the 'see more' button, which signals engagement to the algorithm."
    },
    {
      q: "How do I format specific words without formatting the whole post?",
      a: "Simply highlight the text you want to style in the editor textarea, and then click any style button (e.g. Bold Sans or Italic Serif). The tool will format only the highlighted section."
    }
  ];

  // Selection Formatting handler
  const handleFormatSelection = (style: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // If nothing selected, format everything
    if (start === end) {
      if (!text.trim()) {
        toast({
          title: "Editor is empty",
          description: "Type some text first, or highlight a word to apply custom formatting.",
        });
        return;
      }
      const formattedAll = convertText(text, style);
      setText(formattedAll);
      return;
    }

    const selection = text.substring(start, end);
    const formatted = convertText(selection, style);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + formatted + after;

    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 10);
  };

  // Plaintext stripping handler
  const handleRemoveSelectionFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      const strippedAll = stripUnicodeFormatting(text);
      setText(strippedAll);
      toast({
        title: "All formatting removed",
        description: "Post text returned to standard plaintext.",
      });
      return;
    }

    const selection = text.substring(start, end);
    const stripped = stripUnicodeFormatting(selection);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + stripped + after;

    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + stripped.length);
    }, 10);
  };

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Formatted text copied to clipboard. Ready to paste directly to LinkedIn!",
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

  const handleAutoSchedule = () => {
    if (text.trim()) {
      localStorage.setItem("shipos_pending_draft", text);
    }
    if (user) {
      navigate("/create-post");
    } else {
      navigate("/pricing");
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-background">
      <SEO
        title="Free LinkedIn Text Formatter | Bold & Italic LinkedIn Post Maker"
        description="Format your LinkedIn posts with bold, italic, cursive, and monospace text. Stand out in the LinkedIn feed, increase your click-throughs, and grow your reach."
        path="/linkedin-text-formatter"
        type="website"
        keywords={[
          "linkedin text formatter",
          "bold text linkedin",
          "italic text linkedin",
          "linkedin text generator",
          "unicode text converter"
        ]}
        jsonLd={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Free Tools", path: "/linkedin-text-formatter" },
            { name: "LinkedIn Text Formatter", path: "/linkedin-text-formatter" },
          ]),
          softwareApplicationSchema()
        ]}
      />
      <Header />

      <main className="tools-header-padding pb-10">
        {/* ── Tool Header ── */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Audit your growth potential" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            LinkedIn Text Formatter
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Format your LinkedIn posts with bold, italic, monospace, and cursive text. Stop writing plain paragraphs and make your copy stand out in the feed.
          </p>
        </section>

        {/* ── Main Workspace ── */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Editor & Templates */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Template Row */}
            <div className="border border-border bg-card p-5 rounded-none shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d75a34]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Try Format Templates</h3>
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
                    className="text-left px-3.5 py-2 border border-border bg-muted/20 hover:bg-muted/65 dark:hover:bg-neutral-800 transition-colors rounded-none text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer truncate"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Editor Box */}
            <div className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-foreground tracking-tight border-b border-border pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-[#d75a34]" /> Write Your Post
                </span>
                <span className="text-xs text-muted-foreground font-medium italic">
                  Highlight text to format selection
                </span>
              </h2>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-border/60 text-xs text-muted-foreground select-none">
                <div className="flex flex-wrap gap-1.5 w-full mb-2">
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("bold-sans")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-bold text-foreground cursor-pointer transition-colors"
                    title="Bold Sans-Serif"
                  >
                    𝗕
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("italic-sans")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none italic text-foreground cursor-pointer transition-colors"
                    title="Italic Sans-Serif"
                  >
                    𝘐
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("bold-serif")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-serif font-bold text-foreground cursor-pointer transition-colors"
                    title="Bold Serif"
                  >
                    𝐁
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("italic-serif")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-serif italic text-foreground cursor-pointer transition-colors"
                    title="Italic Serif"
                  >
                    𝘌
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("bold-italic-serif")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-serif font-bold italic text-foreground cursor-pointer transition-colors"
                    title="Bold Italic Serif"
                  >
                    𝑩𝑰
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("monospace")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none font-mono text-foreground cursor-pointer transition-colors text-[11px]"
                    title="Monospace"
                  >
                    𝚠𝚠
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("script")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors"
                    title="Cursive / Script"
                  >
                    𝒲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("double-struck")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors"
                    title="Double-struck / Outline"
                  >
                    𝔻
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("strikethrough")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors line-through"
                    title="Strikethrough"
                  >
                    ab
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelection("underline")}
                    className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors underline"
                    title="Underline"
                  >
                    u
                  </button>
                  <div className="w-[1px] h-6 bg-border/80 mx-1" />
                  <button
                    type="button"
                    onClick={handleRemoveSelectionFormatting}
                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-500 rounded-none text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1"
                    title="Remove text formatting styling"
                  >
                    Tx Remove Formatting
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center w-full pt-1 border-t border-border/40">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60 mr-1.5">Bullets:</span>
                  {["•", "✅", "❌", "🚀", "💡", "📌", "✓", "🔥", "🎯", "👉"].map((bullet) => (
                    <button
                      key={bullet}
                      type="button"
                      onClick={() => handleInsertBullet(bullet + " ")}
                      className="w-7 h-7 flex items-center justify-center bg-muted hover:bg-muted/80 border border-border rounded-none text-foreground cursor-pointer transition-colors"
                    >
                      {bullet}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={11}
                placeholder="Type or paste your post content here, highlight any words, and click the styling buttons above..."
                className="rounded-none border-border text-sm resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-muted-foreground font-semibold tracking-wider">
                  {charCount.toLocaleString()} / 3,000 characters
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setText("")}
                    className="h-9 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none border border-border"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleCopy}
                    className="h-9 px-4 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-wider rounded-none border border-border/20 shadow-sm flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Formatted
                  </Button>
                </div>
              </div>
            </div>

            {/* Looks Good? Auto-Schedule It Card */}
            <div className="border border-border bg-card rounded-none shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fdf2ec] dark:bg-[#3d241c] flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-[#d75a34]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground leading-tight">
                    Looks Good? Auto-Schedule It
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Publish instantly to LinkedIn, X, &amp; more.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Compose once and distribute this styled post across X (Twitter), LinkedIn, Instagram, TikTok, Threads, and Bluesky. Set your custom schedule slots and let ShipOS auto-pilot your audience growth.
              </p>

              <button
                onClick={handleAutoSchedule}
                className="w-full h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 rounded-none transition-colors duration-150 group"
              >
                Auto-Schedule This Post
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Profile Customizer */}
            <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4">
              <h2 className="text-xs font-bold tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
                <User className="w-4.5 h-4.5 text-muted-foreground" /> Customize Mock Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Author Name</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g. Joel Pillar"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Avatar URL (Optional)</label>
                  <Input
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border border-input rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-9 text-xs font-medium bg-background"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Bio / Headline</label>
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

          {/* Right: LinkedIn Feed Previewer */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
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
                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-neutral-100 flex-shrink-0 flex items-center justify-center border-neutral-200 dark:border-neutral-700">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

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

                  {/* Simulated Action Bar */}
                  <div className={`border-t flex items-center justify-around py-1 text-xs font-semibold ${
                    feedTheme === "dark" ? "border-neutral-800 text-neutral-400" : "border-neutral-200 text-neutral-500"
                  }`}>
                    <button className="flex items-center gap-1.5 py-2.5 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <ThumbsUp className="w-4 h-4" /> Like
                    </button>
                    <button className="flex items-center gap-1.5 py-2.5 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Comment
                    </button>
                    <button className="flex items-center gap-1.5 py-2.5 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <Repeat2 className="w-4 h-4" /> Repost
                    </button>
                    <button className="flex items-center gap-1.5 py-2.5 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Warning Card */}
            <div className="border border-amber-500/35 bg-amber-500/[0.03] p-5 rounded-none space-y-2 flex gap-3.5">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider">Formatting Accessibility Tip</h4>
                <p className="text-xs text-amber-800/80 leading-relaxed mt-1">
                  While Unicode styles format letters beautifully, screen readers may skip them. Keep the bulk of your text normal and use formatting selectively for hooks, bullet list titles, and strong keywords.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── How It Works Section ── */}
        <section className="bg-white dark:bg-[#141413] border-t border-b border-border/40 py-20 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
              <SectionBadge label="Workflow" text="How it works under the hood" />
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LinkedIn does not support Markdown or rich text formatting options natively. Here is how our text formatter styling works under the hood.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Write Your Post",
                  desc: "Draft your LinkedIn post content in our editor. You can use standard formatting presets or type your own copy."
                },
                {
                  step: "02",
                  title: "Style Specific Keywords",
                  desc: "Highlight words or sections you want to draw attention to. Click any style (like Bold Sans or Cursive Script) to convert them instantly."
                },
                {
                  step: "03",
                  title: "Copy and Paste",
                  desc: "Click 'Copy Formatted' to save the Unicode output to your clipboard. Paste it directly into the LinkedIn post creator — the styling is preserved!"
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-border bg-card p-6 md:p-8 rounded-none space-y-4">
                  <span className="text-4xl font-black text-[#d75a34]/35 block">{item.step}</span>
                  <h3 className="text-base font-black text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-20 max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-12">
            <SectionBadge label="FAQ" text="Frequently Asked Questions" />
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-4">FAQ</h2>
            <p className="text-sm text-muted-foreground">Answers to commonly asked questions about LinkedIn text formatting.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border bg-card rounded-none overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-foreground hover:text-[#d75a34] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    openFaqIndex === index && "transform rotate-90"
                  )} />
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Platform Demo Video Section */}
        <section className="py-16 bg-white dark:bg-[#141413] border-t border-b border-border/40 relative z-10">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <SectionBadge label="Demo" text="Watch ShipOS in action" />
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

        <FreeToolPricingSection onCtaClick={() => handleAutoSchedule()} />

        <FreeToolFinalCta onCtaClick={handleAutoSchedule} />
      </main>

      <Footer />
    </div>
  );
}
