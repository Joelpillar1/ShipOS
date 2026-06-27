import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Dashboard paths — banner is hidden on these routes
const DASHBOARD_PATHS = [
  "/connect-accounts",
  "/create-post",
  "/bulk-schedule",
  "/content-studio",
  "/slideshow-studio",
  "/analytics",
  "/calendar",
  "/scheduled",
  "/posting-queue",
  "/posted",
  "/drafts",
  "/settings",
  "/workspaces",
  "/help",
  "/admin",
  "/onboarding",
  "/setup-loading",
  "/billing/success",
];

const BANNER_DURATION = 24 * 60 * 60; // 24 hours in seconds

const getInitialSeconds = (): number => {
  try {
    const stored = sessionStorage.getItem("shipos_banner_deadline");
    if (stored) {
      const remaining = Math.floor((parseInt(stored) - Date.now()) / 1000);
      if (remaining > 0) return remaining;
    }
    const deadline = Date.now() + BANNER_DURATION * 1000;
    sessionStorage.setItem("shipos_banner_deadline", String(deadline));
  } catch {
    // sessionStorage unavailable (e.g. private mode restrictions)
  }
  return BANNER_DURATION;
};

const formatCountdown = (secs: number) => {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { h, m, s };
};

export function DiscountBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showBanner, setShowBanner] = useState(true);
  const [countdown, setCountdown] = useState<number>(BANNER_DURATION);

  // Initialise countdown from sessionStorage on mount
  useEffect(() => {
    setCountdown(getInitialSeconds());
  }, []);

  // Tick every second
  useEffect(() => {
    if (!showBanner) return;
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(id); setShowBanner(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showBanner]);

  // Update CSS variable whenever banner visibility or route changes
  const isDashboard = DASHBOARD_PATHS.some((p) =>
    location.pathname === p || location.pathname.startsWith(p + "/")
  );

  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Set/update the --banner-h CSS variable based on the banner element's actual rendered height
  useEffect(() => {
    const el = bannerRef.current;
    const visible = showBanner && !isDashboard;
    
    if (!el || !visible) {
      document.documentElement.style.setProperty("--banner-h", "0px");
      return;
    }

    const updateHeight = () => {
      document.documentElement.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);

    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--banner-h", "0px");
    };
  }, [showBanner, isDashboard]);

  if (isDashboard || !showBanner) return null;

  const { h, m, s } = formatCountdown(countdown);

  return (
    <AnimatePresence>
      <motion.div
        key="promo-banner"
        ref={bannerRef}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[60] w-full"
        style={{ background: "linear-gradient(90deg, #180905 0%, #2d1109 45%, #180905 100%)" }}
            <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-y-1.5 gap-x-3 text-sm">
          {/* Row 1: SALE badge + message */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {/* SALE badge */}
            <span className="shrink-0 inline-flex items-center gap-1 bg-[#d75a34] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
              <Sparkles className="w-3 h-3" />
              SALE
            </span>

            {/* Message */}
            <span className="text-white/90 font-medium text-center leading-snug text-[13px]">
              🎉 Get{" "}
              <span className="text-[#f59e6a] font-bold">50% off</span>{" "}
              your first month — use code{" "}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("SHIPOSD50");
                  toast.success("Copied! Use SHIPOSD50 at checkout.");
                }}
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 text-white font-mono font-bold text-[13px] px-2 py-0.5 rounded transition-all duration-200 cursor-pointer"
                title="Click to copy"
              >
                SHIPOSD50
              </button>
            </span>
          </div>

          {/* Row 2 on mobile / inline on sm+: Countdown + CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1">
              <span className="text-white/50 text-xs font-medium hidden sm:inline">Expires in</span>
              {[h, m, s].map((unit, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="bg-white/10 border border-white/15 text-[#f59e6a] font-mono font-bold text-[13px] px-1.5 py-0.5 rounded min-w-[28px] text-center tabular-nums">
                    {unit}
                  </span>
                  {i < 2 && <span className="text-white/40 font-bold mx-0.5">:</span>}
                </span>
              ))}
            </span>

            {/* CTA */}
            <button
              onClick={() => navigate("/signup")}
              className="shrink-0 hidden sm:inline-flex items-center gap-1 text-[#f59e6a] hover:text-white font-semibold text-xs transition-colors duration-200"
            >
              Claim now <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
