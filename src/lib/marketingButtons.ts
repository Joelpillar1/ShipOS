import { cn } from "@/lib/utils";

/** Neubrutalist offset shadow + lift — only on hover and active, not at rest. */
export const neubrutalistHover =
  "shadow-none hover:border-black dark:hover:border-white hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]";

/** Neubrutalist card lift — pricing cards, hover-only. */
export const pricingCardHover =
  "shadow-none hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]";

/** Standard pricing plan card — equal width in grid, flat at rest. */
export const pricingCardClass = cn(
  "relative border-2 border-black dark:border-white rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between h-full w-full min-w-0 bg-white dark:bg-[#11100e]",
  pricingCardHover
);

/** Popular / highlighted pricing plan card. */
export const pricingCardPopularClass = cn(
  pricingCardClass,
  "bg-[#fbf4f2] dark:bg-[#1a1310]",
  "hover:shadow-[8px_8px_0px_0px_rgba(215,90,52,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(215,90,52,0.35)]"
);

/** Pricing grid + card wrapper + CTA — use together for consistent layout. */
export const pricingGridClass = "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch w-full";
export const pricingCardWrapperClass = "flex flex-col h-full w-full min-w-0";
export const pricingPriceRowClass = "border-t border-b border-border/60 py-4 min-h-[4.5rem] flex items-center";
export const pricingButtonClass = "w-full h-12 mt-8 shrink-0 text-sm font-extrabold tracking-wider";

/** Primary marketing CTA — for `<Link>` and non-Button elements. */
export const marketingButtonPrimary = cn(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-bold transition-all duration-150 cursor-pointer",
  "bg-[#d75a34] text-white hover:bg-[#c54e2a] border border-border",
  neubrutalistHover
);

/** Secondary / outline marketing CTA — for `<Link>` and non-Button elements. */
export const marketingButtonOutline = cn(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-bold transition-all duration-150 cursor-pointer",
  "bg-transparent text-[#d75a34] hover:bg-[#d75a34] hover:text-white active:text-white border border-[#d75a34]",
  neubrutalistHover
);
