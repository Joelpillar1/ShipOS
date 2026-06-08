import React, { useState, useEffect, useRef } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export const CustomCaptcha: React.FC<CustomCaptchaProps> = ({ onVerify }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");
  
  // Use a ref for onVerify to prevent effects from resetting on re-renders
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    // 1. Wait 2 seconds before showing the CAPTCHA widget
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
      setStatus("verifying");
    }, 2000);

    return () => clearTimeout(visibilityTimer);
  }, []);

  useEffect(() => {
    // 2. Start verification only after the widget becomes visible
    if (status === "verifying" && isVisible) {
      const verifyTimer = setTimeout(() => {
        setStatus("success");
        onVerifyRef.current(true);
      }, 3000);

      return () => clearTimeout(verifyTimer);
    }
  }, [status, isVisible]);

  useEffect(() => {
    // 3. Expire the verification after 1 minute (60 seconds) and re-verify
    if (status === "success") {
      const expireTimer = setTimeout(() => {
        onVerifyRef.current(false);
        setStatus("verifying");
      }, 60000);

      return () => clearTimeout(expireTimer);
    }
  }, [status]);

  const handleManualVerify = () => {
    if (status === "success") return;
    setStatus("verifying");
    setTimeout(() => {
      setStatus("success");
      onVerify(true);
    }, 3000);
  };

  return (
    <div 
      className={cn(
        "w-full max-w-[300px] mx-auto border border-[#f0dfd8] bg-[#fdfbf9] h-[65px] flex items-center justify-between px-3 select-none rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-500 ease-out",
        isVisible ? "opacity-100 mb-5 translate-y-0 scale-100" : "opacity-0 mb-0 pointer-events-none -translate-y-2 scale-95 overflow-hidden h-0 border-none py-0"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Verification Icon / Animation */}
        <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
          {status === "verifying" && (
            <svg className="animate-spin w-7 h-7 text-[#d75a34]" viewBox="0 0 100 100">
              <circle cx="50" cy="15" r="7.5" fill="currentColor" opacity="1.0" />
              <circle cx="75" cy="25" r="7.5" fill="currentColor" opacity="0.85" />
              <circle cx="85" cy="50" r="7.5" fill="currentColor" opacity="0.7" />
              <circle cx="75" cy="75" r="7.5" fill="currentColor" opacity="0.55" />
              <circle cx="50" cy="85" r="7.5" fill="currentColor" opacity="0.4" />
              <circle cx="25" cy="75" r="7.5" fill="currentColor" opacity="0.25" />
              <circle cx="15" cy="50" r="7.5" fill="currentColor" opacity="0.15" />
              <circle cx="25" cy="25" r="7.5" fill="currentColor" opacity="0.05" />
            </svg>
          )}

          {status === "success" && (
            <div className="w-5 h-5 rounded-none bg-[#2b7a4b] text-white flex items-center justify-center shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
          )}

          {status === "idle" && (
            <button
              type="button"
              onClick={handleManualVerify}
              className="w-5 h-5 rounded-none border border-[#f0dfd8] bg-white hover:border-[#d75a34] transition-colors cursor-pointer focus:outline-none"
            />
          )}
        </div>

        {/* Status Text Block */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-[#1a1a1a] leading-snug">
            {status === "verifying" && "Verifying security..."}
            {status === "success" && "Verified"}
            {status === "idle" && "Verify connection"}
          </span>
          
          {status === "verifying" && (
            <span className="text-[9px] text-muted-foreground font-semibold mt-0.5 leading-none">
              Securing connection
            </span>
          )}
          
          {status === "success" && (
            <span className="text-[9px] text-[#2b7a4b] font-bold mt-0.5 leading-none">
              Connection secure
            </span>
          )}
        </div>
      </div>

      {/* ShipOS Shield Branding Widget */}
      <div className="flex flex-col items-center justify-center border-l border-[#f0dfd8] pl-3 h-10 flex-shrink-0">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-5.5 h-5.5 text-[#d75a34]" />
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-black text-[#1a1a1a] tracking-wider uppercase leading-none">
              SHIPOS
            </span>
            <span className="text-[7.5px] font-black text-[#d75a34] tracking-[0.5px] uppercase mt-0.5 leading-none">
              SECURE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[7px] text-[#86868b] mt-1.5 leading-none font-semibold">
          <span className="hover:text-foreground cursor-pointer">Security</span>
          <span>•</span>
          <span className="hover:text-foreground cursor-pointer">Terms</span>
        </div>
      </div>
    </div>
  );
};
