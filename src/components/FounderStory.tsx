import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FounderStory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#1f1d1b] border-2 border-black dark:border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.15)] p-6 md:p-10 max-w-4xl mx-auto rounded-none relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Founder Card */}
      <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
        <div className="relative w-44 h-44 bg-muted border-2 border-black dark:border-neutral-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img 
            src="/joel-pillar.jpg" 
            alt="Joel Pillar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-black text-foreground">Joel Pillar</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Founder @ ShipOS</div>
        </div>

        <a 
          href="https://t.me/Joelpillarr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-black dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Send className="w-3.5 h-3.5 text-[#0088cc]" />
          Telegram @Joelpillarr
        </a>
      </div>

      {/* Right Column: Narrative */}
      <div className="md:col-span-8 space-y-6 text-left">
        <h3 className="text-2xl font-black text-foreground tracking-tight">
          Hey, I'm Joel — the guy who built ShipOS.
        </h3>
        
        <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-medium">
          <p>
            If you've ever used an enterprise social media scheduler, you know the drill:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-1 text-muted-foreground">
            <li><strong className="text-foreground">$99+/month per-seat fees</strong> 💰</li>
            <li><strong className="text-foreground">Support tickets</strong> that take days to get a template reply</li>
            <li><strong className="text-foreground">Clunky interfaces</strong> that feel like they haven't been updated since 2012</li>
          </ul>
          <p>
            I built ShipOS because that model is broken. I wanted a fast, simple scheduler that gets out of your way and lets you publish content without the enterprise bloat.
          </p>
          
          <div className="border-l-4 border-[#d75a34] pl-4 py-1 bg-[#d75a34]/5 space-y-2 my-6">
            <p className="font-bold text-foreground">Here's what you get instead:</p>
            <ul className="space-y-2 text-xs">
              <li>💬 <strong className="text-foreground">Direct Support Line:</strong> Reach me directly on Telegram or X. I'm the founder, and I reply.</li>
              <li>🚀 <strong className="text-foreground">Rapid Shipping:</strong> Request a feature and it ships in days, not quarters.</li>
              <li>🛠️ <strong className="text-foreground">Same-Day Bug Fixes:</strong> Found an issue? Report it and it gets fixed within hours.</li>
              <li>👥 <strong className="text-foreground">No Per-Seat Limits:</strong> Add your team, connect your profiles, and scale.</li>
            </ul>
          </div>

          <p>
            We're a small, independent team. That's not a limitation — it's why we move faster and care more about your workflow than any enterprise tool ever will.
          </p>
          
          <p className="font-bold text-foreground">
            Give ShipOS a try for 7 days. If we're not the fastest team you've ever worked with, cancel anytime.
          </p>
        </div>

        <div className="pt-2">
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
