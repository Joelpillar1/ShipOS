import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CornerDownLeft, Bot, Check } from "lucide-react";

interface CycleItem {
  prompt: string;
  result: string;
  platform: "x" | "linkedin" | "threads";
}

const CYCLES: CycleItem[] = [
  {
    prompt: "Write a launch post for my new app ShipOS",
    result: "🚀 Big day! We're officially launching ShipOS today. Plan, schedule, and auto-format your content across all 9 social platforms with one click. Stop copy-pasting, start scaling. #SaaS #buildinpublic",
    platform: "x"
  },
  {
    prompt: "3 tips for building a SaaS as a solo founder",
    result: "💡 Solo founders, save your hours:\n1. Build in public early to gather feedback\n2. Focus on distribution from Day 1\n3. Automate your social media scheduling so you can stay in code.",
    platform: "linkedin"
  },
  {
    prompt: "Why manual social media posting is dead in 2026",
    result: "⏳ Stop copying & pasting your posts between LinkedIn, X, and Threads. It's 2026. ShipOS lets you write once and natively publish everywhere. Save 10+ hours a week.",
    platform: "threads"
  }
];

type Phase = "typing" | "clicking" | "generating" | "showing" | "resetting";

export const AIContentStudioMockup: React.FC = () => {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedPrompt, setTypedPrompt] = useState("");

  const currentCycle = CYCLES[cycleIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "typing") {
      const fullText = currentCycle.prompt;
      if (typedPrompt.length < fullText.length) {
        timer = setTimeout(() => {
          setTypedPrompt(fullText.slice(0, typedPrompt.length + 1));
        }, 40); // speed of typing
      } else {
        // finished typing, wait a bit then transit to clicking
        timer = setTimeout(() => {
          setPhase("clicking");
        }, 800);
      }
    } else if (phase === "clicking") {
      // simulate button click transition
      timer = setTimeout(() => {
        setPhase("generating");
      }, 1000);
    } else if (phase === "generating") {
      // simulate AI processing with shimmers
      timer = setTimeout(() => {
        setPhase("showing");
      }, 1800);
    } else if (phase === "showing") {
      // let the user read the beautifully generated post
      timer = setTimeout(() => {
        setPhase("resetting");
      }, 4500);
    } else if (phase === "resetting") {
      // fade out and clean up
      timer = setTimeout(() => {
        setTypedPrompt("");
        setCycleIndex((prev) => (prev + 1) % CYCLES.length);
        setPhase("typing");
      }, 600);
    }

    return () => clearTimeout(timer);
  }, [phase, typedPrompt, cycleIndex]);

  return (
    <div className="w-full max-w-[290px] h-[190px] bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-md rounded-none flex flex-col overflow-hidden font-sans select-none relative">
      {/* Premium window header */}
      <div className="bg-[#FAF7F5] dark:bg-[#191715] border-b border-gray-100 dark:border-neutral-800/60 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
        </div>
        <div className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <Bot className="w-3 h-3 text-[#d75a34]" /> AI Assistant
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-2 relative overflow-hidden bg-white dark:bg-[#1f1d1b]">
        {/* Input Prompt Box */}
        <div className="border border-gray-200 dark:border-neutral-800 rounded-none p-1.5 pr-1 flex items-center gap-1.5 bg-gray-50/50 dark:bg-neutral-900/50 shadow-inner relative z-10">
          <Sparkles className="w-3.5 h-3.5 text-[#d75a34] shrink-0 animate-pulse" />
          <div className="text-[11px] text-gray-700 dark:text-neutral-200 font-medium flex-1 overflow-hidden whitespace-nowrap relative min-h-[16px] flex items-center">
            {typedPrompt}
            {phase === "typing" && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "steps(2)" }}
                className="w-1 h-3.5 bg-[#d75a34] ml-0.5 inline-block shrink-0"
              />
            )}
          </div>
          
          {/* Virtual Click / Highlight generate button */}
          <motion.button
            animate={
              phase === "clicking"
                ? { scale: [1, 0.9, 1.05, 1], backgroundColor: ["#d75a34", "#bc4622", "#d75a34"] }
                : phase === "generating"
                ? { opacity: 0.8 }
                : {}
            }
            transition={{ duration: 0.4 }}
            className="bg-[#d75a34] text-white rounded-none p-1 px-2.5 flex items-center gap-1 text-[9px] font-bold shrink-0 shadow-sm"
          >
            {phase === "generating" ? (
              <svg className="animate-spin h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Generate"
            )}
          </motion.button>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 relative flex items-center justify-center min-h-[90px]">
          <AnimatePresence mode="wait">
            {phase === "generating" && (
              <motion.div
                key="generating-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/95 dark:bg-[#1f1d1b]/95 z-20"
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-[#d75a34]/20 border-t-[#d75a34] rounded-full"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-[#d75a34] animate-bounce" />
                </div>
                <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold tracking-wide animate-pulse">
                  Drafting platform optimized post...
                </div>
              </motion.div>
            )}

            {phase === "showing" && (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-900 border border-[#d75a34]/30 p-2.5 rounded-none shadow-md z-10 flex flex-col justify-between h-[105px] overflow-hidden"
              >
                {/* Visual marker pointing to the "You pull the trigger" concept */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#d75a34]" />
                
                {/* Result Text */}
                <div className="text-[10px] text-gray-700 dark:text-neutral-200 font-medium leading-relaxed overflow-y-auto max-h-[58px] pr-1 scrollbar-thin">
                  {currentCycle.result}
                </div>

                {/* Footer Controls indicating manual review */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-1.5 mt-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
                      Draft Preview
                    </span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-neutral-700 rounded-full" />
                    <span className="text-[8px] font-bold text-[#d75a34] uppercase tracking-wide flex items-center gap-0.5">
                      {currentCycle.platform === "x" && "🐦 X / Twitter"}
                      {currentCycle.platform === "linkedin" && "💼 LinkedIn"}
                      {currentCycle.platform === "threads" && "🌀 Threads"}
                    </span>
                  </div>
                  
                  {/* Approve/Schedule Button - Highlights "You pull the trigger" */}
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: [0.95, 1.02, 0.95] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-1 bg-[#101010] dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white text-[8px] font-bold py-1 px-2 rounded-none cursor-pointer"
                  >
                    <span>Approve & Publish</span>
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {phase === "typing" && typedPrompt === "" && (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="text-center text-[10px] text-gray-400 font-semibold px-4 space-y-1"
              >
                <div>Ready to generate.</div>
                <div className="text-[9px] opacity-75 font-normal">Waiting for topic prompt input...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
