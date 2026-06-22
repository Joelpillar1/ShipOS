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
        <div className="relative w-24 h-24 bg-muted border-2 border-black dark:border-neutral-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 animate-fade-in">
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
            className="inline-flex items-center gap-2.5 px-4 py-2 border-2 border-black dark:border-neutral-800 text-xs font-black uppercase tracking-wider bg-white dark:bg-neutral-900 text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5"
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
          Hey, I'm Joel. I built ShipOS because I believe software should be insanely great.
        </h3>
        
        <div className="space-y-5 text-sm text-foreground/90 leading-relaxed font-semibold">
          <p>
            Most social media schedulers today are designed for committees and corporations. They are bloated, slow, and force you to pay for features you do not need. They have forgotten what makes tools great: simplicity, speed, and focus.
          </p>

          <p>
            I built ShipOS to change that. No corporate bloat, no committee decisions. Just a single, elegant workspace that lets you compose, customize, and publish your ideas across every platform in seconds.
          </p>
          
          <div className="border-l-4 border-[#d75a34] pl-5 py-3 bg-[#d75a34]/5 space-y-4 my-6">
            <p className="font-bold text-foreground text-sm uppercase tracking-wide">Here is what that focus looks like:</p>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span>
                  <strong className="text-foreground">Direct Support:</strong> You talk to the person who wrote the code. No ticket queues, no template replies.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span>
                  <strong className="text-foreground">Relentless Speed:</strong> If you request a feature that makes sense, it is live in days. If you find a bug, it is fixed in hours.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <span>
                  <strong className="text-foreground">Ultimate Simplicity:</strong> One clean interface that handles all limits, previews, and formats automatically.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-[#d75a34]">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  </svg>
                </span>
                <span>
                  <strong className="text-foreground">No Artificial Limits:</strong> No per-seat fees or penalties for growing your presence.
                </span>
              </li>
            </ul>
          </div>

          <p>
            I'm a solo developer. That is not a limitation; it is why I move faster and care more about your workflow than any enterprise tool ever will. Tools should get out of your way and let you create. That is the promise of ShipOS.
          </p>
          
          <p className="font-bold text-foreground">
            Give ShipOS a try for 7 days. If it is not the most elegant, frictionless tool in your workflow, cancel with a single click. I stand behind it.
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
