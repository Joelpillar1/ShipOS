import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Calendar, Clock, CheckCircle2, ChevronRight, CornerDownLeft } from "lucide-react";

interface ParsedPost {
  id: number;
  text: string;
  charCount: number;
  time: string;
}

const PARSED_POSTS: ParsedPost[] = [
  {
    id: 1,
    text: "It isno to unnecessary features. Bad developers build every feature requested; good developers build exactly what is needed; great developers solve the problem with existing tools. Keep your codebase simple and your technical debt low.",
    charCount: 302,
    time: "09:00 AM"
  },
  {
    id: 2,
    text: "The best programming language is the one that gets the job done. 🔨 Stop arguing over language syntax or framework popularity on forums. Users do not care if your backend is written in Rust.",
    charCount: 190,
    time: "01:00 PM"
  },
  {
    id: 3,
    text: "💡 Focus on distribution from Day 1. You can build the most incredible software in the world, but if nobody knows it exists, it won't sell. Spend at least 50% of your time marketing.",
    charCount: 195,
    time: "05:00 PM"
  }
];

type BulkPhase = "idle" | "uploading" | "parsing" | "spacing" | "submitting" | "success" | "resetting";

export const BulkUploadMockup: React.FC = () => {
  const [phase, setPhase] = useState<BulkPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "idle") {
      timer = setTimeout(() => setPhase("uploading"), 1500);
    } else if (phase === "uploading") {
      // Simulate file upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("parsing");
            return 100;
          }
          return prev + 25;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (phase === "parsing") {
      // Let the posts slide in and settle
      timer = setTimeout(() => setPhase("spacing"), 1800);
    } else if (phase === "spacing") {
      // Auto-space calculations showing up
      timer = setTimeout(() => setPhase("submitting"), 2200);
    } else if (phase === "submitting") {
      // Clicking the bulk schedule button
      timer = setTimeout(() => setPhase("success"), 1000);
    } else if (phase === "success") {
      // Show success screen/toast
      timer = setTimeout(() => setPhase("resetting"), 3500);
    } else if (phase === "resetting") {
      timer = setTimeout(() => {
        setUploadProgress(0);
        setPhase("idle");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="w-full max-w-[480px] h-[196px] bg-white border border-[#f0dfd8]/60 shadow-md rounded-none flex font-sans select-none overflow-hidden text-left relative">
      
      {/* LEFT SIDEBAR: Upload & Target Configuration */}
      <div className="w-[180px] bg-[#FAF7F5] border-r border-gray-200 p-2 flex flex-col justify-between shrink-0">
        <div className="space-y-2">
          {/* Target Channels */}
          <div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              1. Target Channels
            </div>
            <div className="flex gap-1">
              <div className="w-5 h-5 bg-[#d75a34] rounded-none flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                <FileText className="w-3 h-3 text-white" />
              </div>
              {/* Selected platform profiles */}
              <div className="relative w-5 h-5 rounded-none bg-gray-200 border border-[#d75a34] shrink-0">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" alt="" className="w-full h-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-black rounded-none w-1.5 h-1.5 flex items-center justify-center">
                  <span className="text-white text-[4px] font-bold">X</span>
                </div>
              </div>
              <div className="relative w-5 h-5 rounded-none bg-gray-200 border border-[#d75a34] shrink-0">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50" alt="" className="w-full h-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#0077B5] rounded-none w-1.5 h-1.5 flex items-center justify-center">
                  <span className="text-white text-[4px] font-bold">in</span>
                </div>
              </div>
              <div className="w-5 h-5 rounded-none bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 text-[8px] font-bold">
                +4
              </div>
            </div>
          </div>

          {/* CSV File Upload Dropzone */}
          <div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              2. Upload Content
            </div>
            
            <div className={`border border-dashed rounded-none p-1.5 text-center flex flex-col items-center justify-center transition-all ${
              phase === "idle" ? "border-gray-300 bg-white" : "border-[#d75a34] bg-[#d75a34]/5"
            }`}>
              {phase === "idle" ? (
                <>
                  <Upload className="w-3.5 h-3.5 text-gray-400 mb-0.5 animate-bounce" />
                  <div className="text-[7.5px] font-bold text-[#d75a34]">Import CSV</div>
                  <div className="text-[6px] text-gray-400">Drag list here</div>
                </>
              ) : phase === "uploading" ? (
                <div className="w-full space-y-1 py-1">
                  <div className="text-[7px] font-bold text-gray-700">Uploading list...</div>
                  <div className="w-full h-1 bg-gray-200 rounded-none overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#d75a34]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-0.5 flex flex-col items-center">
                  <div className="bg-[#d75a34] text-white p-0.5 rounded-none mb-0.5 shrink-0">
                    <FileText className="w-2.5 h-2.5" />
                  </div>
                  <div className="text-[7px] font-bold text-gray-800 uppercase tracking-tight truncate max-w-[80px]">
                    BOOK1.CSV
                  </div>
                  <div className="text-[6.5px] text-green-600 font-bold flex items-center gap-0.5">
                    <span className="w-1 h-1 bg-green-500 rounded-full inline-block animate-ping"></span> Parsed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacing sequence selection strategy */}
        <div className="border-t border-gray-200 pt-2 space-y-1">
          <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
            3. Spacing Strategy
          </div>
          <div className="bg-white border border-gray-200 p-1 flex flex-col gap-0.5 shadow-sm">
            <div className="flex justify-between items-center text-[7px] font-medium text-gray-600">
              <span>Auto-Spacing:</span>
              <span className="text-[#d75a34] font-bold">Every 4h</span>
            </div>
            <div className="text-[6.5px] text-gray-400 leading-none">
              Starts May 20, 09:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Dispatch Workspace List of Posts */}
      <div className="flex-1 flex flex-col relative bg-white overflow-hidden p-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-800 uppercase tracking-wide">
              Bulk Workspace
            </span>
            {phase !== "idle" && phase !== "uploading" && (
              <span className="text-[7.5px] font-bold bg-green-100 text-green-700 px-1 py-0.5 rounded-none flex items-center gap-0.5">
                <span className="w-1 h-1 bg-green-600 rounded-full"></span> 4 Ready
              </span>
            )}
          </div>
          <span className="text-[7px] font-bold text-gray-400 uppercase">Auto-Space Queue</span>
        </div>

        {/* Scrollable list stack of parsed posts */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin relative min-h-0">
          <AnimatePresence>
            {phase === "idle" || phase === "uploading" ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-[8.5px] font-semibold py-8"
              >
                <FileText className="w-5 h-5 mb-1 opacity-60" />
                <div>Workspace is empty.</div>
                <div className="text-[7px] font-normal">Import a CSV file to populate posts</div>
              </motion.div>
            ) : (
              <motion.div 
                key="posts-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                {PARSED_POSTS.map((post, index) => {
                  const isSpacingActive = phase === "spacing";
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                      className="border border-[#f0dfd8]/50 p-1.5 rounded-none shadow-sm relative overflow-hidden bg-white"
                    >
                      <div className="flex justify-between items-center mb-1 pb-0.5 border-b border-gray-50">
                        <span className="text-[7px] font-extrabold bg-[#101010] text-white px-1 leading-none">
                          #{post.id}
                        </span>
                        <span className="text-[6.5px] text-gray-400 font-medium">
                          ID: parsed-17792
                        </span>
                      </div>
                      
                      {/* Post copy preview */}
                      <p className="text-[7.5px] text-gray-700 leading-normal font-medium truncate mb-1">
                        {post.text}
                      </p>

                      {/* Date & Time controls matching Auto-Space sequence */}
                      <div className="flex justify-between items-center text-[7px] font-semibold text-gray-400 pt-0.5 border-t border-gray-50/50">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-gray-400" /> 05/20/2026
                        </span>
                        
                        {/* Highlights the calculated space-sequence time */}
                        <motion.span 
                          animate={
                            isSpacingActive
                              ? { backgroundColor: ["rgba(215,90,52,0)", "rgba(215,90,52,0.15)", "rgba(215,90,52,0)"], color: ["#9ca3af", "#d75a34", "#9ca3af"] }
                              : {}
                          }
                          transition={{ delay: index * 0.3, duration: 1.2 }}
                          className="flex items-center gap-0.5 px-1 py-0.5 rounded-none"
                        >
                          <Clock className="w-2.5 h-2.5" /> {post.time}
                        </motion.span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions: Submit Dispatch Button */}
        {phase !== "idle" && phase !== "uploading" && (
          <div className="border-t border-gray-100 pt-1.5 mt-1.5 flex items-center justify-between shrink-0">
            <div className="flex flex-col text-left">
              <span className="text-[6.5px] font-bold text-gray-400 uppercase leading-none">
                4 Posts Ready
              </span>
              <span className="text-[6px] text-gray-500 font-medium">
                To 3 platform profiles
              </span>
            </div>
            
            {/* Click-down effect before success */}
            <motion.button
              animate={
                phase === "submitting"
                  ? { scale: [1, 0.92, 1.05, 1], backgroundColor: ["#d75a34", "#bc4622", "#d75a34"] }
                  : {}
              }
              className="bg-[#d75a34] text-white rounded-none py-1.5 px-3 flex items-center gap-1 text-[8px] font-bold shadow-md"
            >
              <span>Schedule 4 In Bulk</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* OVERLAY success screens */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#101010]/35 backdrop-blur-[1px] z-30 flex items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white border border-[#f0dfd8] p-4 flex flex-col items-center text-center gap-2 max-w-[220px] shadow-2xl relative rounded-none"
            >
              {/* Sharp decorative brand corner elements */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#d75a34]" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#d75a34]" />
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#d75a34]" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#d75a34]" />

              <motion.div
                initial={{ scale: 0.6, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
                className="bg-[#d75a34]/10 p-2 rounded-full text-[#d75a34] shadow-sm shrink-0"
              >
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </motion.div>
              
              <div className="space-y-1">
                <div className="text-[10px] font-black text-gray-900 tracking-tight uppercase">
                  Bulk Dispatch Queued!
                </div>
                <p className="text-[7.5px] text-gray-500 leading-normal font-medium">
                  Successfully organized and scheduled <span className="font-bold text-[#d75a34]">4 posts</span> spaced <span className="font-bold text-gray-800">every 4 hours</span> to all 3 platform channels.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
