import React from "react";
import { motion } from "framer-motion";
import { Eye, Users, Heart, Repeat, MessageSquare, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: React.ReactNode;
  color: string; // Tailwind text color class
  bgGradientId: string;
  sparklinePath: string;
  sparklineColor: string; // hex color for SVG stroke
  animationDelay: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 14 } 
  }
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon,
  color,
  bgGradientId,
  sparklinePath,
  sparklineColor,
  animationDelay
}) => {
  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)",
        transition: { duration: 0.2 }
      }}
      className="bg-white dark:bg-[#1e1c1a] border border-gray-200 dark:border-neutral-800/80 p-3 flex flex-col justify-between h-[126px] shadow-sm relative rounded-none hover:border-gray-300 dark:hover:border-neutral-700 transition-colors duration-200"
    >
      
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={color}>
          {icon}
        </div>
      </div>

      {/* Sparkline chart in middle */}
      <div className="w-full h-8 relative mt-1 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 120 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sparklineColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={sparklineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Fill path under the curve with animated opacity */}
          <motion.path
            d={`${sparklinePath} L 120 30 L 0 30 Z`}
            fill={`url(#${bgGradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: animationDelay + 0.9, ease: "easeOut" }}
          />
          {/* Stroke path for curve with self-drawing pathLength animation */}
          <motion.path
            d={sparklinePath}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: animationDelay, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Bottom row: Value & metadata */}
      <div className="flex items-end justify-between mt-1">
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-gray-900 dark:text-neutral-100 tracking-tight leading-none">
            {value}
          </span>
          <span className="text-[8.5px] text-gray-400 dark:text-neutral-500 font-medium tracking-tight mt-0.5 truncate max-w-[125px]">
            {subtitle}
          </span>
        </div>
        
        {/* Percentage badge */}
        <motion.span 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: animationDelay + 0.5 }}
          className={`text-[8.5px] font-bold px-1 py-0.5 shrink-0 select-none ${
            isPositive 
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" 
              : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20"
          }`}
        >
          {change}
        </motion.span>
      </div>
    </motion.div>
  );
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const AnalyticsDashboardMockup: React.FC = () => {
  return (
    <div className="w-[420px] md:w-[460px] mx-auto bg-[#FAF7F5] dark:bg-[#191715] border border-gray-200 dark:border-neutral-800/80 shadow-xl overflow-hidden font-sans rounded-none flex flex-col">
      {/* Mini Top Header Bar mimicking a browser window */}
      <div className="h-7 bg-white dark:bg-[#1e1c1a] border-b border-gray-200 dark:border-neutral-800/80 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
        </div>
        <div className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 tracking-widest uppercase">
          LIVE_PERFORMANCE_ANALYTICS
        </div>
        <div className="w-8" /> {/* spacer */}
      </div>

      {/* Grid of 6 metric cards with entrance variants */}
      <motion.div 
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-20px" }}
        className="grid grid-cols-2 gap-2.5 p-3 bg-gray-50/50 dark:bg-[#151312]"
      >
        
        {/* Total Views Card */}
        <MetricCard
          title="Total Views"
          value="584,291"
          change="+90.5%"
          isPositive={true}
          subtitle="Impressions / video plays"
          icon={<Eye className="w-4 h-4" />}
          color="text-purple-500 dark:text-purple-400"
          bgGradientId="grad-views"
          sparklineColor="#a855f7"
          sparklinePath="M 0 25 C 10 18, 15 22, 25 15 C 35 8, 40 26, 50 10 C 60 -6, 68 28, 78 12 C 88 -4, 98 24, 108 14 C 114 9, 118 20, 120 18"
          animationDelay={0.0}
        />

        {/* Total Reach Card */}
        <MetricCard
          title="Total Reach"
          value="523,418"
          change="+100%"
          isPositive={true}
          subtitle="Unique accounts reached"
          icon={<Users className="w-4 h-4" />}
          color="text-teal-500 dark:text-teal-400"
          bgGradientId="grad-reach"
          sparklineColor="#0d9488"
          sparklinePath="M 0 25 C 20 25, 45 25, 60 12 C 70 3, 85 24, 95 10 C 105 -4, 115 15, 120 4"
          animationDelay={0.1}
        />

        {/* Likes Card */}
        <MetricCard
          title="Likes"
          value="34,892"
          change="+84.7%"
          isPositive={true}
          subtitle="Reactions across platforms"
          icon={<Heart className="w-4 h-4" />}
          color="text-pink-500 dark:text-pink-400"
          bgGradientId="grad-likes"
          sparklineColor="#db2777"
          sparklinePath="M 0 22 C 10 18, 18 24, 25 10 C 32 -4, 38 25, 45 15 C 52 5, 58 24, 65 12 C 72 0, 78 22, 85 10 C 92 -2, 98 18, 105 14 C 112 10, 116 22, 120 15"
          animationDelay={0.2}
        />

        {/* Shares / Reposts Card */}
        <MetricCard
          title="Shares / Reposts"
          value="12,840"
          change="+100%"
          isPositive={true}
          subtitle="Shares, retweets, reposts"
          icon={<Repeat className="w-4 h-4" />}
          color="text-orange-500 dark:text-orange-400"
          bgGradientId="grad-shares"
          sparklineColor="#ea580c"
          sparklinePath="M 0 24 C 10 24, 15 18, 25 22 C 35 26, 45 20, 55 18 C 65 16, 75 22, 85 22 C 95 22, 102 12, 110 15 C 118 18, 119 5, 120 3"
          animationDelay={0.3}
        />

        {/* Comments Card */}
        <MetricCard
          title="Comments"
          value="8,491"
          change="+82.5%"
          isPositive={true}
          subtitle="Replies & comments"
          icon={<MessageSquare className="w-4 h-4" />}
          color="text-blue-500 dark:text-blue-400"
          bgGradientId="grad-comments"
          sparklineColor="#2563eb"
          sparklinePath="M 0 26 C 15 26, 25 18, 35 24 C 45 30, 52 20, 60 22 C 68 24, 75 14, 85 18 C 95 22, 105 15, 110 20 C 115 25, 118 8, 120 6"
          animationDelay={0.4}
        />

        {/* Engagement Rate Card */}
        <MetricCard
          title="Engagement Rate"
          value="8.2%"
          change="+20%"
          isPositive={true}
          subtitle="(Likes+Comments+Shares)/Views"
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-sky-500 dark:text-sky-400"
          bgGradientId="grad-engagement"
          sparklineColor="#0284c7"
          sparklinePath="M 0 22 C 12 18, 25 24, 38 18 C 50 12, 62 20, 75 16 C 88 12, 100 18, 112 10 C 116 7, 118 14, 120 12"
          animationDelay={0.5}
        />
      </motion.div>
    </div>
  );
};
