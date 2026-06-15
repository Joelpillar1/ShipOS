import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Type, Palette, Layout, Download, ArrowLeft, ArrowRight, Check } from "lucide-react";

type CaseStyle = "sentence" | "uppercase" | "lowercase";

const SLIDES = [
  {
    text: "Building a profitable SaaS in 2026",
    bg: "#d76742",
    font: "'Anton', sans-serif",
  },
  {
    text: "Stop copy-pasting posts manually",
    bg: "#1c1c1c",
    font: "'Oswald', sans-serif",
  },
  {
    text: "Focus on distribution from Day 1",
    bg: "#34785c",
    font: "'Playfair Display', serif",
  }
];

export const SlideshowStudioMockup: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [caseStyle, setCaseStyle] = useState<CaseStyle>("sentence");
  const [activeTab, setActiveTab] = useState<"text" | "design" | "export">("text");

  const currentSlide = SLIDES[slideIndex];

  // Auto-animate text casing and slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCaseStyle((prev) => {
        if (prev === "sentence") return "uppercase";
        if (prev === "uppercase") return "lowercase";
        return "sentence";
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getCasedText = (text: string, style: CaseStyle) => {
    if (style === "uppercase") return text.toUpperCase();
    if (style === "lowercase") return text.toLowerCase();
    
    // Sentence case helper
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="w-full max-w-[290px] h-[190px] bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-md rounded-none flex flex-col overflow-hidden font-sans select-none relative">
      {/* Window Header */}
      <div className="bg-[#FAF7F5] dark:bg-[#191715] border-b border-gray-100 dark:border-neutral-800/60 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/80"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400/80"></div>
          <div className="w-2 h-2 rounded-full bg-green-400/80"></div>
        </div>
        <div className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Layout className="w-2.5 h-2.5 text-[#d75a34]" /> Slideshow Studio
        </div>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#1f1d1b]">
        {/* Left Side: Mock Editor Sidebar Controls */}
        <div className="w-24 border-r border-gray-100 dark:border-neutral-800/60 bg-[#FAF7F5] dark:bg-[#191715] p-1.5 flex flex-col gap-2 justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="text-[7px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
              Text Case
            </div>
            {/* Casing Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-0.5">
              {(["sentence", "uppercase", "lowercase"] as CaseStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setCaseStyle(style)}
                  className={`text-[8px] font-extrabold py-0.5 text-center transition-colors ${
                    caseStyle === style
                      ? "bg-[#d75a34] text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  {style === "sentence" && "Aa"}
                  {style === "uppercase" && "AA"}
                  {style === "lowercase" && "aa"}
                </button>
              ))}
            </div>

            <div className="text-[7px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mt-1">
              Fonts
            </div>
            <div className="text-[8px] font-semibold bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-1 truncate text-gray-700 dark:text-neutral-300">
              {currentSlide.font.split(",")[0].replace(/'/g, "")}
            </div>
          </div>

          {/* Export PDF Indicator */}
          <div className="bg-[#1c1c1c] text-white p-1 flex items-center justify-center gap-1 cursor-pointer">
            <Download className="w-2.5 h-2.5 text-[#d75a34]" />
            <span className="text-[7px] font-black uppercase tracking-wider">Export PDF</span>
          </div>
        </div>

        {/* Right Side: Visual Slide Canvas */}
        <div className="flex-1 p-2 flex flex-col justify-between items-center bg-gray-50/50 dark:bg-neutral-900/30 relative">
          {/* Active Canvas Slide Preview */}
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex-1 border border-black/10 flex flex-col justify-between p-3 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: currentSlide.bg }}
          >
            {/* Slide Header Branding */}
            <div className="flex items-center justify-between z-10 shrink-0">
              <span style={{ fontSize: "6px" }} className="font-extrabold text-white/70 tracking-widest uppercase">
                ShipOS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#d75a34]"></div>
            </div>

            {/* Slide Text Content */}
            <div className="flex-1 flex items-center justify-center py-2 z-10">
              <h2
                style={{
                  fontFamily: currentSlide.font,
                  fontSize: "12px",
                  lineHeight: "1.2",
                  color: "#ffffff",
                  textAlign: "center",
                }}
                className="font-bold tracking-tight text-white drop-shadow-sm px-1"
              >
                {getCasedText(currentSlide.text, caseStyle)}
              </h2>
            </div>

            {/* Slide Page Indicator */}
            <div className="flex justify-end z-10 shrink-0">
              <span style={{ fontSize: "6px" }} className="font-black text-white/50">
                0{slideIndex + 1}
              </span>
            </div>
          </motion.div>

          {/* Nav Controls below slide */}
          <div className="w-full flex items-center justify-between pt-1.5 px-1 shrink-0">
            <button
              onClick={handlePrevSlide}
              className="text-gray-400 hover:text-black dark:hover:text-white p-0.5 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800"
            >
              <ArrowLeft className="w-2.5 h-2.5" />
            </button>
            <span className="text-[8px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
              Slide {slideIndex + 1} of {SLIDES.length}
            </span>
            <button
              onClick={handleNextSlide}
              className="text-gray-400 hover:text-black dark:hover:text-white p-0.5 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800"
            >
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
