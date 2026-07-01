import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, Send, Trash2, Plus, ChevronLeft, ChevronRight, 
  Layout, AlignLeft, AlignCenter, AlignRight 
} from "lucide-react";

type CaseStyle = "sentence" | "uppercase" | "lowercase";
type Alignment = "left" | "center" | "right";

const SLIDES_DATA = [
  "You are not bad at social media you just have the wrong workflow.",
  "Here is the step-by-step layout of how we scale brands...",
  "1. Outline your main topic inside the composer.",
  "2. AI splits content into multiple platform updates.",
  "Ready to scale? Link in bio to try ShipOS free!"
];

export const SlideshowStudioMockup: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [caseStyle, setCaseStyle] = useState<CaseStyle>("sentence");
  const [alignment, setAlignment] = useState<Alignment>("center");

  const getCasedText = (text: string, style: CaseStyle) => {
    if (style === "uppercase") return text.toUpperCase();
    if (style === "lowercase") return text.toLowerCase();
    
    // Sentence case formatting helper
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="w-[420px] md:w-[460px] mx-auto bg-white dark:bg-[#1a1816] border border-gray-200 dark:border-neutral-800 shadow-xl overflow-hidden font-sans rounded-none flex flex-col h-[270px] select-none text-[#1A1A1A] dark:text-neutral-200">
      
      {/* Window Title Bar */}
      <div className="bg-white dark:bg-[#1e1c1a] border-b border-gray-200 dark:border-neutral-800/80 h-7 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
        </div>
        <div className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 tracking-widest uppercase">
          SLIDESHOW_STUDIO_EDITOR
        </div>
        <div className="w-8" />
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden bg-gray-50/50 dark:bg-[#151312]">
        
        {/* Pane A: Left Nav Sidebar (Compact Dashboard mockup) */}
        <div className="w-[54px] border-r border-gray-200 dark:border-neutral-800 bg-[#FAF7F5] dark:bg-[#1e1c1a] p-1.5 flex flex-col justify-between shrink-0">
          <div className="flex flex-col items-center">
            {/* Logo Badge */}
            <div className="w-9 h-4 bg-[#d75a34] flex items-center justify-center rounded-[2px] text-white text-[7px] font-black uppercase tracking-wider mb-4 shadow-sm">
              ShipOS
            </div>

            {/* Menu options mimicking the real sidebar */}
            <div className="flex flex-col gap-3 w-full items-center">
              <div className="flex flex-col items-center gap-0.5 cursor-pointer opacity-40">
                <Layout className="w-3 h-3" />
                <span className="text-[5px] font-bold">Studio</span>
              </div>
              
              {/* Active Slideshow Studio menu option */}
              <div className="flex flex-col items-center gap-0.5 cursor-pointer text-[#d75a34] relative">
                <Layout className="w-3.5 h-3.5" />
                <span className="text-[5.5px] font-black uppercase tracking-tight">Slideshow</span>
                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-1 h-2 bg-[#d75a34]" />
              </div>

              <div className="flex flex-col items-center gap-0.5 cursor-pointer opacity-40">
                <Layout className="w-3 h-3" />
                <span className="text-[5px] font-bold">Queue</span>
              </div>

              <div className="flex flex-col items-center gap-0.5 cursor-pointer opacity-40">
                <Layout className="w-3 h-3" />
                <span className="text-[5px] font-bold">Analytics</span>
              </div>
            </div>
          </div>

          {/* Profile Badge Mockup at bottom */}
          <div className="flex items-center gap-1 border-t border-gray-200 dark:border-neutral-850 pt-1.5 justify-center">
            <div className="w-4 h-4 rounded-full bg-[#d75a34] text-white flex items-center justify-center text-[7px] font-extrabold shadow-inner shrink-0">
              JP
            </div>
          </div>
        </div>

        {/* Pane B: Center Active Canvas */}
        <div className="flex-1 p-2 flex flex-col justify-between items-center bg-[#F8F6F4] dark:bg-[#131110] relative overflow-hidden">
          
          {/* Miniature Top Action Row */}
          <div className="w-full flex items-center justify-between shrink-0 mb-1 px-1">
            <button className="text-[6px] font-bold text-gray-500 dark:text-neutral-400 bg-white dark:bg-[#1e1c1a] px-1.5 py-0.5 border border-gray-200 dark:border-neutral-800 rounded-[2px] shadow-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              &lt; All Slideshows
            </button>
            <div className="flex gap-1">
              <button className="text-[6px] font-extrabold bg-[#d75a34] text-white px-1.5 py-0.5 border border-black rounded-[2px] shadow-sm hover:bg-[#c54e2a] transition-colors">
                Save
              </button>
              <button className="text-[6px] font-bold text-rose-500 bg-white dark:bg-[#1e1c1a] px-1.5 py-0.5 border border-rose-200 dark:border-neutral-800 rounded-[2px] shadow-sm hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors">
                Reset All
              </button>
            </div>
          </div>

          {/* Portrait Slide Canvas Card */}
          <div className="w-[110px] h-[138px] bg-[#d75a34] shadow-md border border-black/10 flex flex-col justify-between p-2 relative shrink-0">
            {/* Branding Header inside Slide */}
            <div className="flex justify-between items-center leading-none">
              <span className="text-[5px] font-black text-white/70 tracking-widest uppercase">
                ShipOS
              </span>
              <div className="w-1 h-1 rounded-full bg-white/40" />
            </div>

            {/* Slide Text body */}
            <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${slideIndex}-${caseStyle}-${alignment}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  className={`text-[7.5px] font-bold tracking-tight text-white leading-tight break-words px-0.5 w-full ${
                    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center"
                  }`}
                >
                  {getCasedText(SLIDES_DATA[slideIndex], caseStyle)}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Footer page number inside Slide */}
            <div className="flex justify-end leading-none">
              <span className="text-[5.5px] font-black text-white/50">
                0{slideIndex + 1}
              </span>
            </div>
          </div>

          {/* Navigation Controls below the slide */}
          <div className="w-full flex flex-col items-center shrink-0 mt-1">
            <span className="text-[5.5px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-bold mb-0.5">
              Drag elements to reposition them
            </span>
            
            <div className="w-full flex items-center justify-between px-1">
              <button 
                onClick={() => setSlideIndex(prev => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length)}
                className="p-0.5 bg-white dark:bg-[#1e1c1a] border border-gray-200 dark:border-neutral-800 rounded-[2px] hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-2.5 h-2.5" />
              </button>
              
              <span className="text-[7px] font-black text-gray-500 dark:text-neutral-400">
                {slideIndex + 1} / {SLIDES_DATA.length}
              </span>

              <button 
                onClick={() => setSlideIndex(prev => (prev + 1) % SLIDES_DATA.length)}
                className="p-0.5 bg-white dark:bg-[#1e1c1a] border border-gray-200 dark:border-neutral-800 rounded-[2px] hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Slide Deck/Thumbnails Scroll Carousel */}
          <div className="w-full border-t border-gray-200 dark:border-neutral-800/80 pt-1.5 flex gap-1 justify-center shrink-0">
            {SLIDES_DATA.map((text, idx) => (
              <div
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`w-[17px] h-[22px] cursor-pointer relative shadow-sm border transition-all duration-150 rounded-[1px] flex flex-col justify-between p-0.5 text-center ${
                  idx === slideIndex 
                    ? "bg-[#d75a34] border-black scale-105" 
                    : "bg-[#d75a34]/60 border-black/10 hover:scale-105"
                }`}
              >
                <span className="text-[4px] font-black text-white/50 leading-none text-left">
                  {idx + 1}
                </span>
                <span className="text-[3px] font-bold text-white leading-[4px] truncate block w-full px-0.5">
                  {text}
                </span>
                <div />
              </div>
            ))}
            {/* Plus add button placeholder */}
            <div className="w-[17px] h-[22px] border border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center cursor-pointer hover:border-gray-500 dark:hover:border-neutral-500 rounded-[1px]">
              <Plus className="w-2 h-2 text-gray-400" />
            </div>
          </div>

        </div>

        {/* Pane C: Right Settings Sidebar Panel */}
        <div className="w-[136px] border-l border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1e1c1a] p-2 flex flex-col justify-between shrink-0 overflow-y-auto scrollbar-none">
          <div className="flex flex-col gap-2">
            
            {/* Format row */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Format</span>
              <div className="text-[7.5px] font-extrabold bg-[#Faf8f6] dark:bg-[#151312] border border-gray-200 dark:border-neutral-800 p-1 flex justify-between items-center rounded-[2px]">
                <span>Portrait — 4:5</span>
                <ChevronRight className="w-2 h-2 text-gray-400 rotate-90" />
              </div>
            </div>

            {/* Slide Type row */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Slide Type</span>
              <div className="text-[7.5px] font-extrabold bg-[#Faf8f6] dark:bg-[#151312] border border-gray-200 dark:border-neutral-800 p-1 flex justify-between items-center rounded-[2px]">
                <span>Normal Slide</span>
                <ChevronRight className="w-2 h-2 text-gray-400 rotate-90" />
              </div>
            </div>

            {/* Active Block Content Text Area Box */}
            <div className="flex flex-col gap-0.5 border-t border-gray-100 dark:border-neutral-800 pt-1.5">
              <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Active Block Content</span>
              <div className="text-[7px] font-semibold bg-[#Faf8f6] dark:bg-[#151312] border border-gray-200 dark:border-neutral-800 p-1.5 leading-snug break-words rounded-[2px] max-h-[36px] overflow-hidden text-ellipsis">
                {SLIDES_DATA[slideIndex]}
              </div>
            </div>

            {/* Font Picker */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Font</span>
              <div className="text-[7.5px] font-extrabold bg-[#Faf8f6] dark:bg-[#151312] border border-gray-200 dark:border-neutral-800 p-1 flex justify-between items-center rounded-[2px]">
                <span className="font-bold">Space Grotesk</span>
                <ChevronRight className="w-2 h-2 text-gray-400 rotate-90" />
              </div>
            </div>

            {/* Font Case & Alignment Options */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Text Case Toggles */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Text Case</span>
                <div className="flex border border-gray-200 dark:border-neutral-800 overflow-hidden rounded-[2px] p-0.5 gap-0.5 bg-[#FAF8F6] dark:bg-[#151312]">
                  {(["sentence", "uppercase", "lowercase"] as CaseStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setCaseStyle(style)}
                      className={`flex-1 text-[6.5px] font-black py-0.5 text-center transition-colors rounded-[1px] ${
                        caseStyle === style
                          ? "bg-[#d75a34] text-white"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {style === "sentence" && "Aa"}
                      {style === "uppercase" && "AA"}
                      {style === "lowercase" && "aa"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[6.5px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">Alignment</span>
                <div className="flex border border-gray-200 dark:border-neutral-800 overflow-hidden rounded-[2px] p-0.5 gap-0.5 bg-[#FAF8F6] dark:bg-[#151312]">
                  <button 
                    onClick={() => setAlignment("left")}
                    className={`flex-1 flex justify-center py-0.5 transition-colors rounded-[1px] ${
                      alignment === "left" ? "bg-[#d75a34] text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <AlignLeft className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => setAlignment("center")}
                    className={`flex-1 flex justify-center py-0.5 transition-colors rounded-[1px] ${
                      alignment === "center" ? "bg-[#d75a34] text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <AlignCenter className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => setAlignment("right")}
                    className={`flex-1 flex justify-center py-0.5 transition-colors rounded-[1px] ${
                      alignment === "right" ? "bg-[#d75a34] text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <AlignRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Action buttons at bottom */}
          <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-neutral-850 pt-1.5 shrink-0">
            <button className="w-full py-1 text-[7px] font-black uppercase border border-gray-200 dark:border-neutral-800 bg-[#FAF8F6] dark:bg-[#151312] hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 rounded-[2px] shadow-sm">
              <Download className="w-2 h-2 text-[#d75a34]" /> Download
            </button>
            <button className="w-full py-1 text-[7px] font-black uppercase text-white bg-[#d75a34] hover:bg-[#c54e2a] border border-black/10 transition-colors flex items-center justify-center gap-1 rounded-[2px] shadow-sm">
              <Send className="w-2 h-2" /> Send to post
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
