import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FounderStory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#1f1d1b] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] p-8 md:p-12 max-w-3xl mx-auto rounded-none relative z-10">
      
      {/* Header: Founder Details */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b-2 border-dashed border-neutral-200 dark:border-neutral-800">
        <div className="relative w-24 h-24 bg-muted border-2 border-black dark:border-neutral-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <img 
            src="/joel-pillar.jpg" 
            alt="Joel Pillar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <div className="text-2xl font-black text-foreground">Joel Pillar</div>
            <div className="text-xs font-black text-[#d75a34] uppercase tracking-wider">Founder @ ShipOS</div>
          </div>

          <a 
            href="https://x.com/Joelpillar1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 border-2 border-black dark:border-neutral-800 text-xs font-black uppercase tracking-wider bg-white dark:bg-neutral-900 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow @Joelpillar1
          </a>
        </div>
      </div>

      {/* Narrative Body */}
      <div className="space-y-6 pt-8 text-left">
        <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">
          Hey, I'm Joel. I built ShipOS.
        </h3>
        
        <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-semibold">
          <p>
            If you've ever used an enterprise social media scheduler, you know the drill:
          </p>
          
          <ul className="space-y-3.5 pl-1">
            <li className="flex items-start gap-3.5">
              <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-red-500">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </svg>
              </span>
              <span>
                <strong className="text-foreground">$99+/month per-seat fees</strong> that penalize you for growing your team.
              </span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-red-500">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <span>
                <strong className="text-foreground">Support tickets</strong> that sit in queues for days just to receive a templated response.
              </span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-red-500">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
              </span>
              <span>
                <strong className="text-foreground">Clunky interfaces</strong> that feel like outdated, legacy enterprise software.
              </span>
            </li>
          </ul>

          <p>
            I built ShipOS because that model is broken. I wanted a fast, simple scheduler that gets out of your way and lets you publish content without the enterprise bloat.
          </p>
          
          <div className="border-l-4 border-[#d75a34] pl-5 py-3 bg-[#d75a34]/5 space-y-4 my-6">
            <p className="font-bold text-foreground text-sm uppercase tracking-wide">Here's what you get instead:</p>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <span className="text-xs">
                  <strong className="text-foreground">Direct Support Line:</strong> Reach me directly on X. I am the founder, and I reply to messages.
                </span>
              </li>
              <li className="flex items-start gap-3 text-xs">
                <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span className="text-xs">
                  <strong className="text-foreground">Rapid Shipping:</strong> Request a feature and it will be developed in days.
                </span>
              </li>
              <li className="flex items-start gap-3 text-xs">
                <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </span>
                <span className="text-xs">
                  <strong className="text-foreground">Same-Day Bug Fixes:</strong> Found an issue? Report it and it gets fixed within hours.
                </span>
              </li>
              <li className="flex items-start gap-3 text-xs">
                <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="text-xs">
                  <strong className="text-foreground">No Per-Seat Limits:</strong> Add your workspace, connect your profiles, and scale without penalty.
                </span>
              </li>
            </ul>
          </div>

          <p>
            I'm a solo developer. That's not a limitation; it's why I move faster and care more about your workflow than any enterprise tool ever will.
          </p>
          
          <p className="font-bold text-foreground">
            Give ShipOS a try for 7 days. If I'm not the fastest developer you've ever worked with, cancel anytime.
          </p>
        </div>

        <div className="pt-6 flex justify-center sm:justify-start">
          <Button
            onClick={() => navigate("/signup")}
            className="bg-[#d75a34] hover:bg-[#c54e2a] text-white font-bold text-xs uppercase tracking-[0.12em] py-4 px-6 h-auto rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0.5 hover:translate-y-1 transition-all flex items-center gap-2"
          >
            Try ShipOS for $0
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};
