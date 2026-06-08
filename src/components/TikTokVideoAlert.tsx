import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

interface TikTokVideoAlertProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  width: number;
  height: number;
}

export const TikTokVideoAlert: React.FC<TikTokVideoAlertProps> = ({
  isOpen,
  onClose,
  fileName,
  width,
  height,
}) => {
  const ratio = width > 0 && height > 0 ? width / height : 0;

  // Formatting helpers for the current video dimensions
  const getAspectRatioText = (w: number, h: number) => {
    if (w === 0 || h === 0) return "Unknown";
    const r = w / h;
    if (Math.abs(r - 9/16) <= 0.05) return "9:16 (Vertical)";
    if (Math.abs(r - 1) <= 0.05) return "1:1 (Square)";
    if (Math.abs(r - 4/5) <= 0.05) return "4:5 (Portrait)";
    if (Math.abs(r - 16/9) <= 0.05) return "16:9 (Landscape)";
    return `${w}:${h} (~${r.toFixed(2)}:1)`;
  };

  const isAspectRatioValid =
    Math.abs(ratio - 9/16) <= 0.02 ||
    Math.abs(ratio - 1) <= 0.02 ||
    Math.abs(ratio - 4/5) <= 0.02;

  const isResolutionValid = width >= 720 && height >= 720;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden bg-background/95 backdrop-blur-lg border-2 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
        
        {/* Apple-style premium colored header background accent */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-red-600" />
        
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-3 flex flex-col items-center text-center">
            {/* Visual Header Icon */}
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 border-2 border-black flex items-center justify-center relative shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Video className="w-6 h-6 text-foreground" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border border-black flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
            
            <div className="space-y-1">
              <DialogTitle className="text-base font-black uppercase tracking-wider text-foreground">
                TikTok Formatting Required
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Video properties need adjustment for publishing
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Video Metadata Comparison Panel */}
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 border border-black text-[11px] font-mono leading-relaxed truncate">
              <span className="text-muted-foreground uppercase font-bold mr-1">File:</span>
              <span className="text-foreground font-semibold">{fileName}</span>
            </div>

            {/* Spec Sheet Grid */}
            <div className="border border-black divide-y divide-black font-medium text-xs">
              {/* Aspect Ratio Row */}
              <div className="grid grid-cols-12 p-3 bg-card gap-2">
                <div className="col-span-4 text-muted-foreground uppercase font-bold tracking-wider text-[10px] flex items-center">
                  Aspect Ratio
                </div>
                <div className="col-span-8 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                    <span className="text-red-500 shrink-0">✕</span>
                    <span>{getAspectRatioText(width, height)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                    <span>Requires 9:16 (Vertical), 1:1, or 4:5</span>
                  </div>
                </div>
              </div>

              {/* Resolution Row */}
              <div className="grid grid-cols-12 p-3 bg-card gap-2">
                <div className="col-span-4 text-muted-foreground uppercase font-bold tracking-wider text-[10px] flex items-center">
                  Resolution
                </div>
                <div className="col-span-8 space-y-1">
                  <div className={`flex items-center gap-1.5 font-bold ${isResolutionValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    <span>{isResolutionValid ? "✓" : "✕"}</span>
                    <span>{width > 0 && height > 0 ? `${width} × ${height}` : "Unknown"}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                    <span>Requires 720p+ (Min. 720px width & height)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={onClose}
              className="w-full rounded-none bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-wider text-xs h-10 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Got It
            </Button>
            
            <a 
              href="https://newsroom.tiktok.com/" 
              target="_blank" 
              rel="noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full rounded-none bg-card hover:bg-muted text-foreground font-black uppercase tracking-wider text-xs h-10 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                TikTok Video Guidelines
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
