import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CornerDownLeft, Plus, Send, Sparkles } from "lucide-react";

interface ProfileItem {
  id: string;
  avatarUrl: string;
  platform: "x" | "linkedin" | "threads" | "instagram";
  targetDay: number;
}

const FLYING_PROFILES: ProfileItem[] = [
  {
    id: "p1",
    avatarUrl: "/demo/avatar-1507.webp",
    platform: "x",
    targetDay: 21
  },
  {
    id: "p2",
    avatarUrl: "/demo/avatar-1618.webp",
    platform: "linkedin",
    targetDay: 21
  },
  {
    id: "p3",
    avatarUrl: "/demo/avatar-1507.webp",
    platform: "instagram",
    targetDay: 25
  }
];

// Existing static scheduled items in the calendar for realism
const STATIC_SCHEDULED: Record<number, { avatarUrl: string; platform: "x" | "linkedin" | "threads" | "instagram" }[]> = {
  18: [
    { avatarUrl: "/demo/avatar-1507.webp", platform: "x" },
    { avatarUrl: "/demo/avatar-1618.webp", platform: "threads" },
    { avatarUrl: "/demo/avatar-1507.webp", platform: "linkedin" }
  ],
  27: [
    { avatarUrl: "/demo/avatar-1618.webp", platform: "instagram" }
  ],
  30: [
    { avatarUrl: "/demo/avatar-1507.webp", platform: "x" },
    { avatarUrl: "/demo/avatar-1618.webp", platform: "linkedin" }
  ]
};

type CalendarPhase = "idle" | "composing" | "scheduling" | "animating" | "landed" | "resetting";

export const CalendarMockup: React.FC = () => {
  const [phase, setPhase] = useState<CalendarPhase>("idle");
  
  // Coordinates mapping of day cells relative to the calendar grid container
  // This allows the profile cards to "jump/fly" precisely to their destination cell
  const [gridCoords, setGridCoords] = useState<Record<number, { x: number; y: number }>>({});
  const [composerCoords, setComposerCoords] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "idle") {
      timer = setTimeout(() => setPhase("composing"), 1200);
    } else if (phase === "composing") {
      // Simulate input details being typed / prepared
      timer = setTimeout(() => setPhase("scheduling"), 2000);
    } else if (phase === "scheduling") {
      // Clicking the schedule button trigger
      timer = setTimeout(() => setPhase("animating"), 800);
    } else if (phase === "animating") {
      // Duration of flight animation
      timer = setTimeout(() => setPhase("landed"), 1200);
    } else if (phase === "landed") {
      // Hold state to show scheduled items arranged in the grid
      timer = setTimeout(() => setPhase("resetting"), 3500);
    } else if (phase === "resetting") {
      timer = setTimeout(() => setPhase("idle"), 500);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  // Capture grid cell references to compute fly trajectories
  const registerCell = (day: number, element: HTMLDivElement | null) => {
    if (element && !gridCoords[day]) {
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement?.parentElement?.getBoundingClientRect();
      if (parent) {
        setGridCoords(prev => ({
          ...prev,
          [day]: {
            x: rect.left - parent.left,
            y: rect.top - parent.top
          }
        }));
      }
    }
  };

  // Capture composer elements references
  const registerComposerItem = (id: string, element: HTMLDivElement | null) => {
    if (element && !composerCoords[id]) {
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
      if (parent) {
        setComposerCoords(prev => ({
          ...prev,
          [id]: {
            x: rect.left - parent.left,
            y: rect.top - parent.top
          }
        }));
      }
    }
  };

  // Render Platform Badge Icon
  const renderBadge = (platform: "x" | "linkedin" | "threads" | "instagram", size: string = "w-3 h-3") => {
    switch (platform) {
      case "x":
        return (
          <div className={`${size} bg-black rounded-none flex items-center justify-center border-[0.5px] border-white/20 shrink-0`}>
            <svg className="w-[60%] h-[60%] text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        );
      case "linkedin":
        return (
          <div className={`${size} bg-[#0077B5] rounded-none flex items-center justify-center border-[0.5px] border-white/20 shrink-0`}>
            <svg className="w-[60%] h-[60%] text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
        );
      case "threads":
        return (
          <div className={`${size} bg-[#101010] rounded-none flex items-center justify-center border-[0.5px] border-white/20 shrink-0`}>
            <svg className="w-[60%] h-[60%] text-white" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
            </svg>
          </div>
        );
      case "instagram":
        return (
          <div className={`${size} bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] rounded-none flex items-center justify-center border-[0.5px] border-white/20 shrink-0`}>
            <svg className="w-[65%] h-[65%] text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
            </svg>
          </div>
        );
    }
  };

  const daysRow1 = [17, 18, 19, 20, 21, 22, 23];
  const daysRow2 = [24, 25, 26, 27, 28, 29, 30];

  return (
    <div className="w-full max-w-[290px] h-[196px] bg-white dark:bg-[#1f1d1b] border border-[#f0dfd8]/60 dark:border-neutral-800/80 shadow-md rounded-none flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Top Bar: Composer Interface (Shows draft preparing to schedule) */}
      <div className="bg-[#FAF7F5] dark:bg-[#191715] border-b border-gray-200 dark:border-neutral-800/60 px-3 py-1.5 flex items-center justify-between gap-1.5 relative z-10">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="bg-[#d75a34]/10 rounded-none p-1 shrink-0">
            <Sparkles className="w-3 h-3 text-[#d75a34]" />
          </div>
          <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold overflow-hidden whitespace-nowrap text-ellipsis flex-1">
            {phase === "idle" ? "Waiting..." : phase === "composing" ? "Drafting: Scaling SaaS Tips..." : "Ready to schedule"}
          </div>
        </div>

        {/* Schedule Button */}
        <motion.button
          animate={
            phase === "scheduling"
              ? { scale: [1, 0.92, 1.05, 1], backgroundColor: ["#d75a34", "#bc4622", "#d75a34"] }
              : {}
          }
          className="bg-[#d75a34] text-white rounded-none p-1 px-2 flex items-center gap-0.5 text-[8.5px] font-bold shrink-0 shadow-sm transition-colors"
        >
          <span>Schedule</span>
        </motion.button>
      </div>

      {/* Main Calendar Section */}
      <div className="flex-1 p-2 flex flex-col bg-white dark:bg-[#1f1d1b] select-none relative">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="text-[10px] font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#d75a34]" /> May 2026
          </div>
          <div className="text-[8px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
            Monthly Queue
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-[1px] border-b border-gray-100 dark:border-neutral-800/80 pb-1 mb-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <span key={i} className="text-[7.5px] font-bold text-gray-400 dark:text-neutral-500">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-[1.5px] bg-gray-100 dark:bg-neutral-800 flex-1 p-[0.5px]">
          {/* Row 1 cells */}
          {daysRow1.map(day => (
            <div
              key={day}
              ref={el => registerCell(day, el)}
              className={`bg-[#FAF7F5]/70 dark:bg-[#191715]/75 relative p-0.5 flex flex-col justify-between min-h-[30px] border border-transparent ${
                day === 20 ? "bg-[#1c2024]/5 dark:bg-neutral-800/40 border-[#1c2024]/10 dark:border-neutral-700/60" : ""
              }`}
            >
              {/* Day number */}
              <div className="flex justify-between items-start">
                <span className={`text-[8px] font-bold leading-none ${
                  day === 20 ? "bg-black dark:bg-[#FAF7F5] text-white dark:text-black px-1 py-0.5 text-[7px]" : "text-gray-500 dark:text-neutral-400"
                }`}>
                  {day}
                </span>
              </div>
              
              {/* Scheduled profile avatars list in cell */}
              <div className="flex gap-[1.5px] flex-wrap mt-auto">
                {STATIC_SCHEDULED[day]?.map((item, idx) => (
                  <div key={idx} className="relative w-4 h-4 bg-gray-200 dark:bg-neutral-800 border border-white dark:border-neutral-900 shrink-0">
                    <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {renderBadge(item.platform, "w-1.5 h-1.5")}
                    </div>
                  </div>
                ))}
                
                {/* Dynamically scheduled items once landed */}
                {phase === "landed" && day === 21 && (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative w-4 h-4 bg-gray-200 dark:bg-neutral-800 border border-white dark:border-neutral-900 shrink-0 shadow-sm"
                    >
                      <img src="/demo/avatar-1507.webp" alt="" className="w-full h-full object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {renderBadge("x", "w-1.5 h-1.5")}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative w-4 h-4 bg-gray-200 dark:bg-neutral-800 border border-white dark:border-neutral-900 shrink-0 shadow-sm"
                    >
                      <img src="/demo/avatar-1618.webp" alt="" className="w-full h-full object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {renderBadge("linkedin", "w-1.5 h-1.5")}
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Row 2 cells */}
          {daysRow2.map(day => (
            <div
              key={day}
              ref={el => registerCell(day, el)}
              className="bg-[#FAF7F5]/70 dark:bg-[#191715]/75 relative p-0.5 flex flex-col justify-between min-h-[30px]"
            >
              {/* Day number */}
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-bold text-gray-500 dark:text-neutral-400 leading-none">
                  {day}
                </span>
              </div>
              
              {/* Scheduled profile avatars list in cell */}
              <div className="flex gap-[1.5px] flex-wrap mt-auto">
                {STATIC_SCHEDULED[day]?.map((item, idx) => (
                  <div key={idx} className="relative w-4 h-4 bg-gray-200 dark:bg-neutral-800 border border-white dark:border-neutral-900 shrink-0">
                    <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {renderBadge(item.platform, "w-1.5 h-1.5")}
                    </div>
                  </div>
                ))}

                {/* Dynamically scheduled items once landed */}
                {phase === "landed" && day === 25 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative w-4 h-4 bg-gray-200 dark:bg-neutral-800 border border-white dark:border-neutral-900 shrink-0 shadow-sm"
                  >
                    <img src="/demo/avatar-1507.webp" alt="" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {renderBadge("instagram", "w-1.5 h-1.5")}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLYING PROFILES ELEMENT OVERLAY */}
      {/* These profiles render on top of the layout and fly along spring paths from composer to target grid coordinate cells */}
      <AnimatePresence>
        {(phase === "animating" || phase === "composing" || phase === "scheduling") && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {FLYING_PROFILES.map((profile, index) => {
              // Target coordinate
              const target = gridCoords[profile.targetDay];
              
              // Start coordinate (Simulating coming from composer area or floating in preview)
              const startX = 65 + index * 26;
              const startY = 11;

              // If animation hasn't started yet, render in composer draft preview
              const isIdle = phase === "composing" || phase === "scheduling";

              return (
                <motion.div
                  key={profile.id}
                  initial={
                    isIdle
                      ? { x: startX, y: startY, scale: 0, opacity: 0 }
                      : { x: startX, y: startY, scale: 0.9, opacity: 1 }
                  }
                  animate={
                    isIdle
                      ? { scale: 0.9, opacity: 1 }
                      : target
                      ? {
                          x: [startX, (startX + target.x) / 2, target.x + 2], // Curve arc flight
                          y: [startY, Math.min(startY, target.y) - 35, target.y + 12],
                          scale: [0.9, 1.25, 0.45], // shrinks to tiny icon in cell
                          opacity: [1, 1, 1]
                        }
                      : {}
                  }
                  exit={{ opacity: 0, scale: 0 }}
                  transition={
                    isIdle
                      ? { type: "spring", stiffness: 120, damping: 12 }
                      : {
                          duration: 0.9,
                          ease: [0.25, 1, 0.5, 1], // satisfying fast arc ease-out
                          delay: index * 0.08 // stagger launch
                        }
                  }
                  className="absolute"
                  style={{ top: 0, left: 0 }}
                >
                  <div className="relative w-6 h-6 rounded-none bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 shadow-md p-[1px] flex items-center justify-center shrink-0">
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 shadow-sm">
                      {renderBadge(profile.platform, "w-2.5 h-2.5")}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
