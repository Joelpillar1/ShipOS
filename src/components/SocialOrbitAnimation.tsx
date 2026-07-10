import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SOCIAL_ICONS = [
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
        <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
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
    name: "Bird Twitter",
    bg: "bg-[#1DA1F2]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
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

const POST_CARDS = [
  {
    platform: "Twitter",
    user: "Alex Rivera",
    handle: "@alexrivera",
    avatarUrl: "/avatars/men-32.webp",
    content: "Hot take: if you're still copy-pasting posts to each platform manually, you're leaving hours on the table every week 🧵",
    time: "2m",
    likes: "847",
    comments: "62",
    shares: "215",
  },
  {
    platform: "LinkedIn",
    user: "Sarah Chen",
    handle: "@sarahchen",
    avatarUrl: "/avatars/women-44.webp",
    content: "Excited to share that our team just hit 50K followers across all channels using ShipOS. The scheduling tools are game-changing 🎯",
    time: "1mo",
    likes: "2,103",
    comments: "184",
    shares: "96",
  },
  {
    platform: "Instagram",
    user: "Maya Johnson",
    handle: "mayacreates",
    avatarUrl: "/avatars/women-68.webp",
    postImageUrl: "/demo/post-social.webp",
    content: "Behind the scenes of our content workflow ✨ One draft, five platforms, zero stress. This is the way. #contentcreator",
    time: "5m ago",
    likes: "3,421",
    comments: "127",
    shares: "58",
  },
  {
    platform: "TikTok",
    user: "David Park",
    handle: "@davidpark",
    avatarUrl: "/avatars/men-46.webp",
    postImageUrl: "/demo/post-food.webp",
    content: "5 tips that 10x'd our social reach this quarter 👇 #growth #marketing",
    time: "12m ago",
    likes: "12.4K",
    comments: "931",
    shares: "3.4K",
  },
  {
    platform: "Threads",
    user: "Emma Wilson",
    handle: "emmawrites",
    avatarUrl: "/avatars/women-22.webp",
    content: "Evergreen content loop: 5 tips to scale SaaS organically. 🧵",
    time: "15m",
    likes: "512",
    comments: "48",
    shares: "124",
  }
];

export const SocialOrbitAnimation = () => {
  return (
    <div className="relative w-full max-w-[1400px] h-[500px] mx-auto bg-transparent overflow-hidden flex items-center justify-center [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      {/* Central ShipOS/ChatGPT Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div 
          className="w-24 h-24 rounded-2xl bg-white border-2 border-black/10 shadow-xl flex items-center justify-center origin-center"
          animate={{
            scale: [1, 1.08, 1, 0.96, 1],
            rotate: [0, -3, 3, -2, 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
           <img 
              src="/logo-icon.png" 
              alt="ShipOS" 
              className="w-16 h-16 object-contain"
            />
        </motion.div>
      </div>

      {/* Incoming Social Nodes (Left Side) */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-visible">
        {SOCIAL_ICONS.map((social, i) => {
          // Deterministic starting positions to prevent jumping on re-renders
          const startPositions = [120, 380, 200, 80, 320, 260, 420, 160, 50, 350];
          const startY = startPositions[i % startPositions.length];
          
          // Continuous, evenly spaced loop
          const duration = 6;
          const delay = i * (duration / SOCIAL_ICONS.length);
          
          return (
            <motion.div
              key={`in-${i}`}
              className={cn(
                "absolute w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg border border-black/5 z-10",
                social.bg
              )}
              initial={{ 
                left: "-10%", 
                top: startY,
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                left: [ "-10%", "40%", "100%" ], 
                top: [ startY, startY * 0.7 + 75, 250 ], // Converges in a straight line towards 250 (center)
                opacity: [0, 1, 0], // Fade in, hold, fade out at center
                scale: [0.5, 1, 0.2] // Shrink as it gets absorbed
              }}
              transition={{ 
                duration, 
                delay, 
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 1] 
              }}
            >
              {social.icon}
            </motion.div>
          );
        })}
      </div>

      {/* Outgoing Post Cards (Right Side) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-visible">
        {POST_CARDS.map((post, i) => {
          // Perfectly staggered continuous loop
          const duration = 12;
          const delay = i * (duration / POST_CARDS.length);
          
          return (
            <motion.div
              key={`out-${i}`}
              className={cn(
                "absolute w-[320px] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 flex flex-col overflow-hidden",
                post.platform === "TikTok" ? "bg-black text-white h-[480px]" : "bg-white border border-gray-200"
              )}
              style={{ top: "50%", translateY: "-50%" }}
              initial={{ 
                x: 0,
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                x: [0, 250, 750],
                opacity: [0, 1, 0], 
                scale: [0.5, 1, 1]
              }}
              transition={{ 
                duration, 
                delay, 
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.2, 1]
              }}
            >
              {/* LINKEDIN EXACT MATCH */}
              {post.platform === "LinkedIn" && (
                <div className="flex flex-col w-full p-4 font-sans bg-white">
                  <div className="flex items-start gap-2.5 mb-3 relative">
                    <img src={post.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex flex-col flex-1 leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-semibold text-gray-900">{post.user}</span>
                        <span className="text-gray-500 font-normal text-[14px]"> • 1st</span>
                      </div>
                      <span className="text-[12px] text-gray-500 mt-0.5">Founder & CEO</span>
                      <span className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">{post.time} • Edited <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 11V6h1.5v4.3l4.5 4.5-.8.8z"/></svg></span>
                    </div>
                    <div className="absolute right-0 top-0 text-gray-500 text-xl font-bold tracking-widest leading-none">...</div>
                  </div>
                  <p className="text-[14px] text-gray-900 mb-4 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex items-center text-[12px] text-gray-500 mb-2.5 px-1">
                    <div className="flex items-center -space-x-1 mr-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#0a66c2] flex items-center justify-center ring-1 ring-white z-20"><svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M21 9h-4.3l1.1-4.8c.1-.5-.1-1.1-.4-1.4-.3-.3-.8-.4-1.2-.3L9 5.8V21h9.3c.9 0 1.7-.6 1.9-1.5l1.8-8c.3-1.1-.6-2.5-1-2.5zM7 21H3V9h4v12z"/></svg></div>
                      <div className="w-4 h-4 rounded-full bg-[#e8a32a] flex items-center justify-center ring-1 ring-white z-10"><svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 00-6 6c0 1.9 1 3.6 2.5 4.6V15c0 .6.4 1 1 1h5c.6 0 1-.4 1-1v-2.4c1.5-1 2.5-2.7 2.5-4.6 0-3.3-2.7-6-6-6zm1 14h-2v2h2v-2zm-1 5c-.6 0-1-.4-1-1h2c0 .6-.4 1-1 1z"/></svg></div>
                    </div>
                    <span>{post.likes}</span>
                    <span className="ml-auto hover:underline cursor-pointer">{post.comments} Comments</span>
                  </div>
                  <div className="h-[1px] w-full bg-gray-200 mb-1.5"></div>
                  <div className="flex items-center justify-between px-1 text-gray-500">
                    <div className="flex items-center gap-1.5 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.88L8.89 9H4.11A2.11 2.11 0 002 11.11V13a2.08 2.08 0 00.86 1.68l.2.14a2.12 2.12 0 00-.2 1A2.11 2.11 0 005 18H17.82A2.18 2.18 0 0020 15.82V12a1 1 0 00-.54-.9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> <span className="text-[13px] font-semibold">Like</span></div>
                    <div className="flex items-center gap-1.5 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> <span className="text-[13px] font-semibold">Comment</span></div>
                    <div className="flex items-center gap-1.5 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 3v4a1 1 0 01-1 1H4a1 1 0 010-2h4V3m4-1h8v8m-1.5-6.5L10 14"/></svg> <span className="text-[13px] font-semibold">Share</span></div>
                  </div>
                </div>
              )}

              {/* INSTAGRAM EXACT MATCH */}
              {post.platform === "Instagram" && (
                <div className="flex flex-col w-full bg-white font-sans text-gray-900">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                        <img src={post.avatarUrl} className="w-full h-full rounded-full border border-white object-cover" />
                      </div>
                      <span className="text-[14px] font-semibold">{post.handle}</span>
                    </div>
                    <div className="font-bold tracking-widest text-gray-600 flex items-center h-full mb-2 cursor-pointer">...</div>
                  </div>
                  <div className="w-full h-64 bg-gray-100 relative">
                    <img src={post.postImageUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-4">
                        <svg className="w-6 h-6 hover:text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <svg className="w-6 h-6 hover:text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <svg className="w-6 h-6 hover:text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                      </div>
                      <svg className="w-6 h-6 hover:text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    </div>
                    <div className="text-[14px] font-semibold mb-1">{post.likes} likes</div>
                    <div className="text-[14px] leading-tight mb-1">
                      <span className="font-semibold mr-1.5">{post.handle}</span>
                      {post.content}
                    </div>
                  </div>
                </div>
              )}

              {/* TIKTOK EXACT MATCH */}
              {post.platform === "TikTok" && (
                <div className="relative w-full h-full bg-black font-sans text-white">
                  <img src={post.postImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none"></div>
                  
                  {/* Header */}
                  <div className="absolute top-4 left-0 right-0 flex justify-center items-center gap-6 text-[15px] font-semibold drop-shadow-md z-10">
                    <span className="opacity-60 cursor-pointer hover:opacity-100">Following</span>
                    <span className="relative pb-2 cursor-pointer">
                      For You
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-white rounded-full"></div>
                    </span>
                    <svg className="absolute right-4 w-5 h-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  
                  {/* Right Actions */}
                  <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-10">
                    <div className="relative w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center p-[2px] mb-1">
                      <img src={post.avatarUrl} className="w-full h-full rounded-full object-cover" />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#fe2c55] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black text-white cursor-pointer"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg></div>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <svg className="w-8 h-8 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <span className="text-[12px] font-semibold drop-shadow-md">{post.likes}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <svg className="w-8 h-8 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                      <span className="text-[12px] font-semibold drop-shadow-md">{post.comments}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <svg className="w-8 h-8 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                      <span className="text-[12px] font-semibold drop-shadow-md">Save</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <svg className="w-8 h-8 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M14 11V8l7 4-7 4v-3H9v-2h5zm-2-2v2H7v2h5v2l7-3-7-3z" transform="rotate(-45, 12, 12)"/></svg>
                      <span className="text-[12px] font-semibold drop-shadow-md">{post.shares}</span>
                    </div>
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="absolute left-3 bottom-4 right-16 z-10 flex flex-col gap-1.5 pr-2">
                    <div className="font-bold text-[15px] drop-shadow-md">{post.handle}</div>
                    <div className="text-[14px] leading-[1.3] drop-shadow-md pr-4">
                      {post.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[13px] font-medium drop-shadow-md cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      <span className="truncate">original sound - {post.user}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TWITTER EXACT MATCH */}
              {post.platform === "Twitter" && (
                <div className="flex flex-col w-full p-4 font-sans bg-white">
                  <div className="flex items-start gap-3 mb-2">
                    <img src={post.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col leading-tight pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[15px] font-bold text-gray-900">{post.user}</span>
                        <svg className="w-4 h-4 text-[#1D9BF0]" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.607-.274 1.264-.144 1.897.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" /></svg>
                      </div>
                      <span className="text-[14px] text-gray-500">{post.handle}</span>
                    </div>
                    <div className="ml-auto text-gray-400">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </div>
                  </div>
                  <p className="text-[15px] text-gray-900 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  <div className="text-[14px] text-gray-500 mb-3 flex items-center gap-1">
                    {post.time} <span className="text-gray-400">&middot;</span> <span className="text-gray-900 font-bold">12K</span> Views
                  </div>
                  <div className="h-[1px] w-full bg-gray-100 mb-2.5"></div>
                  <div className="flex items-center justify-between text-gray-500 px-1">
                    <div className="flex items-center gap-2 hover:text-[#1D9BF0] cursor-pointer group transition-colors"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div><span className="text-[13px]">{post.comments}</span></div>
                    <div className="flex items-center gap-2 hover:text-[#00BA7C] cursor-pointer group transition-colors"><div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10"><svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></div><span className="text-[13px]">{post.shares}</span></div>
                    <div className="flex items-center gap-2 hover:text-[#F91880] cursor-pointer group transition-colors"><div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10"><svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div><span className="text-[13px]">{post.likes}</span></div>
                    <div className="flex items-center hover:text-[#1D9BF0] cursor-pointer group transition-colors"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg></div></div>
                  </div>
                </div>
              )}

              {/* THREADS EXACT MATCH */}
              {post.platform === "Threads" && (
                <div className="flex flex-col w-full p-4 font-sans bg-white relative">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <img src={post.avatarUrl} className="w-10 h-10 rounded-full object-cover z-10" />
                      <div className="w-[1.5px] h-[60px] bg-gray-200 mt-2"></div>
                      <div className="w-4 h-4 rounded-full mt-2 relative overflow-hidden">
                        <img src="/avatars/men-32.webp" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[15px] font-semibold text-gray-900">{post.handle}</span>
                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="text-[14px]">{post.time}</span>
                          <span className="font-bold cursor-pointer">...</span>
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-900 leading-relaxed mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-gray-900">
                        <svg className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <svg className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <svg className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        <svg className="w-5 h-5 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      </div>
                      <div className="text-[14px] text-gray-500 mt-2">
                        {post.comments} replies &middot; {post.likes} likes
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
