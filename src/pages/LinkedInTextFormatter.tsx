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
  Info,
  Type,
  Maximize2,
  ChevronRight
} from "lucide-react";

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
  const [authorName, setAuthorName] = useState("Alex Rivers");
  const [authorHeadline, setAuthorHeadline] = useState("Founder @ ShipOS | Building the future of social automation");
  const [authorAvatar, setAuthorAvatar] = useState("");

  // Simulated feed state
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [feedTheme, setFeedTheme] = useState<"light" | "dark">("light");
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // General utility states
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

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

      <main className="pt-28 pb-10">
        {/* ── Tool Header ── */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-12">
          <SectionBadge label="Free Tool" text="Format & Stand Out" />
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
                    placeholder="E.g. Alex Rivers"
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
            <div className="text-center max-w-2xl mx-auto mb-16">
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
          <div className="text-center mb-12">
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

        {/* ── Pricing Block ── */}
        <section className="py-20 bg-white dark:bg-[#141413] border-t border-border/40 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
                Ready to Schedule Your Social Content?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Take your social growth to auto-pilot. Plan, schedule, and automate posts to all platforms.
              </p>

              {/* Toggle switch */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <span className={cn("text-xs font-bold tracking-wider uppercase", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                <span className={cn("text-xs font-bold tracking-wider uppercase flex items-center gap-1.5", isAnnual ? "text-foreground" : "text-muted-foreground")}>
                  Yearly <Badge className="bg-[#d75a34] text-white rounded-none border-none py-0 px-1.5 text-[9px] font-black tracking-widest">SAVE 20%</Badge>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
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
                        onClick={handleAutoSchedule}
                        className={cn(
                          "w-full h-12 font-bold tracking-widest text-[10px] rounded-none shadow-none transition-all",
                          plan.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background text-foreground border border-border hover:bg-muted",
                        )}
                      >
                        Start 7-Day Free Trial
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Guarantee strip */}
            <div className="flex items-center justify-center gap-3 mt-10 text-muted-foreground text-center">
              <Check className="w-4 h-4 shrink-0" />
              <p className="text-[10px] font-bold tracking-[0.15em] leading-relaxed">
                Secure checkout via Dodo Payments • Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA Banner ── */}
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
                Your content is styled. Now let ShipOS ship it.
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
                onClick={handleAutoSchedule}
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
