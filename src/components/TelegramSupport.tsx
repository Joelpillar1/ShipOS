import React from "react";

export const TelegramSupport: React.FC = () => {
  return (
    <a
      href="https://t.me/Joelpillarr"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 bg-[#26A5E4] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer group rounded-none"
      title="Get Support on Telegram"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 sm:w-7 sm:h-7 fill-current transform group-hover:scale-110 transition-transform"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.86-1.68 6.43-2.78 7.72-3.3 3.67-1.49 4.43-1.75 4.93-1.76.11 0 .35.03.51.16.13.11.17.26.19.37.02.1.03.22.01.34z" />
      </svg>
      {/* Neo-brutalist Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] border border-white whitespace-nowrap">
        Support @Joelpillarr
      </span>
    </a>
  );
};
