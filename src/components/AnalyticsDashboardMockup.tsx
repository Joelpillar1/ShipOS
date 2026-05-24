import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = ["WEEKLY", "MONTHLY", "QUARTERLY"] as const;
type Tab = typeof TABS[number];

export const AnalyticsDashboardMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("MONTHLY");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; views: number } | null>(null);

  // Auto-cycle tabs every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(prev => {
        const nextIndex = (TABS.indexOf(prev) + 1) % TABS.length;
        return TABS[nextIndex];
      });
      setHoveredPoint(null); // Reset hover on transition
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate sine-wave points dynamically based on active tab
  const generateChartPath = (tab: Tab) => {
    let path = "M 0 160 "; // Start at bottom left
    const points = [];
    const numHumps = 5;
    const width = 800;
    const height = 160;
    const segmentWidth = width / numHumps;

    const peaks = {
      WEEKLY: [70, 40, 85, 30, 60],
      MONTHLY: [20, 20, 20, 20, 20],
      QUARTERLY: [40, 100, 30, 90, 20]
    }[tab];

    const troughs = {
      WEEKLY: [120, 110, 130, 90, 140],
      MONTHLY: [145, 145, 145, 145, 145],
      QUARTERLY: [130, 140, 110, 135, 145]
    }[tab];

    const peakDates = {
      WEEKLY: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      MONTHLY: ["Sep 28", "Oct 4", "Oct 12", "Oct 18", "Oct 24"],
      QUARTERLY: ["Jul", "Aug", "Sep", "Oct", "Nov"]
    }[tab];

    const viewsBase = {
      WEEKLY: 2000,
      MONTHLY: 11000,
      QUARTERLY: 35000
    }[tab];

    for (let i = 0; i <= numHumps; i++) {
      const x0 = i * segmentWidth;
      
      if (i < numHumps) {
        const py = peaks[i];
        const prevTrough = i === 0 ? height : troughs[i - 1];
        const endY = troughs[i];

        // Curve up and then down for a hump
        const cx1 = x0 + segmentWidth * 0.2;
        const cy1 = prevTrough - 10;
        const cx2 = x0 + segmentWidth * 0.4;
        const cy2 = py;
        const px = x0 + segmentWidth * 0.5;
        
        const cx3 = x0 + segmentWidth * 0.7;
        const cy3 = py;
        const cx4 = x0 + segmentWidth * 0.9;
        const cy4 = endY + 5;
        const endX = x0 + segmentWidth;

        path += `C ${cx1} ${cy1}, ${cx2} ${cy2}, ${px} ${py} `;
        path += `C ${cx3} ${cy3}, ${cx4} ${cy4}, ${endX} ${endY} `;
        
        // Save the peak point for tooltips
        points.push({
          x: px,
          y: py,
          date: peakDates[i],
          views: viewsBase + Math.floor((160 - py) * 50)
        });
      }
    }
    
    // Line back to bottom right to close the area
    const areaPath = path + `L ${width} ${height} Z`;
    return { path, areaPath, points };
  };

  const { path: strokePath, areaPath, points: chartPoints } = generateChartPath(activeTab);

  return (
    <div className="w-full bg-[#FAF7F5] border border-gray-200 shadow-xl overflow-hidden font-sans rounded-none flex flex-col">

      {/* 3. Impressions Trend Chart */}
      <div className="bg-white border border-gray-200 p-4 md:p-6 pb-2">
        {/* Chart Header & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Impressions Trend</h3>
            <p className="text-sm text-gray-500 font-medium">Views over recent posts</p>
          </div>
          <div className="flex border border-gray-200 text-xs font-bold shrink-0 self-start sm:self-auto">
            {TABS.map((tab) => (
              <div 
                key={tab} 
                onClick={() => { setActiveTab(tab); setHoveredPoint(null); }}
                className={cn(
                  "px-4 py-1.5 cursor-pointer transition-colors duration-300",
                  tab === activeTab ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* SVG Chart Area */}
        <div className="w-full flex flex-col pt-4">
          {/* Interactive Chart Container */}
          <div className="flex w-full h-[200px] md:h-[240px] border-b border-gray-200">
            {/* Y-Axis Labels */}
            <div className="w-10 md:w-12 flex flex-col justify-between text-[10px] font-semibold text-gray-400 py-1 shrink-0 bg-white relative z-10">
              <span className="translate-y-[-50%]">12000</span>
              <span className="translate-y-[-50%]">9000</span>
              <span className="translate-y-[-50%]">6000</span>
              <span className="translate-y-[-50%]">3000</span>
              <span className="translate-y-[50%]">0</span>
            </div>

            {/* SVG Data Area & Stroke */}
            <div className="flex-1 relative h-full">
              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 bg-white border border-gray-200 shadow-xl p-2.5 flex flex-col items-center gap-1 min-w-[90px] pointer-events-none"
                  style={{ left: `calc(${(hoveredPoint.x / 800) * 100}% - 45px)`, top: hoveredPoint.y - 65 }}
                >
                  <span className="text-xs font-bold text-gray-800">{hoveredPoint.date}</span>
                  <span className="text-xs text-gray-500 font-medium">views: <span className="font-bold text-gray-900">{hoveredPoint.views}</span></span>
                  {/* Tooltip triangle tail */}
                  <div className="absolute -bottom-1.5 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45"></div>
                </motion.div>
              )}

              {/* Grid Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 200">
                <line x1="0" y1="20" x2="800" y2="20" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="140" x2="800" y2="140" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth="1" />
              </svg>

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d75a34" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d75a34" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                
                {/* Fill Area - Animated */}
                <motion.path 
                  animate={{ d: areaPath }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  fill="url(#chartGradient)" 
                />
                
                {/* Line Stroke - Animated */}
                <motion.path 
                  animate={{ d: strokePath }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  fill="none" stroke="#d75a34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                />
                
                {/* Vertical Guide Line on Hover */}
                {hoveredPoint && (
                  <line 
                    x1={hoveredPoint.x} 
                    y1={hoveredPoint.y} 
                    x2={hoveredPoint.x} 
                    y2="200" 
                    stroke="#e5e7eb" 
                    strokeWidth="1.5" 
                  />
                )}
                
                {/* Data Points (Hover targets) */}
                {chartPoints.map((pt, i) => (
                  <g key={i} className="cursor-pointer group">
                    {/* Invisible larger hover target */}
                    <motion.circle
                      animate={{ cx: pt.x, cy: pt.y }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      r="20"
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Visible point - Animated */}
                    <motion.circle
                      animate={{ cx: pt.x, cy: pt.y }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      r="4"
                      className={cn(
                        "transition-colors duration-200 fill-white",
                        hoveredPoint?.x === pt.x ? "stroke-[#d75a34] stroke-[3px]" : "stroke-[#d75a34] stroke-[2px] group-hover:stroke-[3px]"
                      )}
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* X-Axis Labels (Date string at bottom) */}
          <div className="flex ml-10 md:ml-12 justify-between text-[10px] font-semibold text-gray-500 pt-3 px-2">
            {/* Displaying static dates or animated? Let's just keep the old dates as requested before, or map over the active tab's peakDates if we wanted them evenly spaced. For simplicity and since X-axis labels aren't strictly aligned to humps in a continuous timeline, we map out the peakDates for this demo. */}
            {chartPoints.map((pt, i) => (
              <span key={i}>{pt.date}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
