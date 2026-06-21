import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hero "hub" diagram: a central ShipOS logo framed by concentric squares,
 * with social platform cards floating around it and circuit lines flowing
 * each platform inward to the center — "every channel, one place to run it".
 */

type Node = {
  name: string;
  bg: string;
  icon: React.ReactNode;
  /** card position, centered on this point (percent of the square container) */
  pos: { top: string; left: string };
  /** matching endpoint in the 0–400 SVG space for the connector line */
  point: { x: number; y: number };
  /** float animation delay so the cards don't bob in unison */
  delay: number;
};

const NODES: Node[] = [
  {
    name: "YouTube",
    bg: "bg-[#FF0000]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    pos: { top: "7%", left: "50%" },
    point: { x: 200, y: 32 },
    delay: 0,
  },
  {
    name: "LinkedIn",
    bg: "bg-[#0077B5]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    pos: { top: "25%", left: "87%" },
    point: { x: 348, y: 100 },
    delay: 0.8,
  },
  {
    name: "Instagram",
    bg: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    pos: { top: "49%", left: "10%" },
    point: { x: 40, y: 196 },
    delay: 1.6,
  },
  {
    name: "X (Twitter)",
    bg: "bg-[#101010]",
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    pos: { top: "61%", left: "89%" },
    point: { x: 356, y: 244 },
    delay: 0.4,
  },
  {
    name: "Facebook",
    bg: "bg-[#1877F2]",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    pos: { top: "90%", left: "46%" },
    point: { x: 184, y: 360 },
    delay: 1.2,
  },
];

const CENTER = { x: 200, y: 200 };

export const HeroOrbitDiagram = () => {
  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-square select-none">
      {/* Concentric frames + connector lines */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Three nested square frames (sharp corners to match the app) */}
        <rect x="60" y="60" width="280" height="280" fill="none" stroke="currentColor" className="text-[#d75a34]/10" strokeWidth="1" />
        <rect x="100" y="100" width="200" height="200" fill="none" stroke="currentColor" className="text-[#d75a34]/15" strokeWidth="1" />
        <rect x="140" y="140" width="120" height="120" fill="none" stroke="currentColor" className="text-[#d75a34]/20" strokeWidth="1" />

        {/* Connector lines: each platform flows inward to the center hub */}
        {NODES.map((n, i) => {
          const id = `flow-${i}`;
          return (
            <g key={id}>
              <path
                id={id}
                d={`M${n.point.x},${n.point.y} L${CENTER.x},${CENTER.y}`}
                fill="none"
                stroke="currentColor"
                className="text-[#d75a34]/25"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              {/* endpoint node sitting under each card */}
              <circle cx={n.point.x} cy={n.point.y} r="2.5" className="fill-[#d75a34]/40" />
              {/* electric current dot travelling card -> center */}
              <circle r="2.5" className="fill-[#d75a34]" filter="url(#hubGlow)">
                <animateMotion dur="2.4s" begin={`${n.delay}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                  <mpath href={`#${id}`} />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${n.delay}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Center hub: ShipOS logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {/* soft brand glow */}
        <div className="absolute inset-0 -m-6 bg-[#d75a34]/20 blur-2xl rounded-full" />
        <motion.div
          className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center"
          animate={{ scale: [1, 1.04, 1], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/logo-icon.png" alt="ShipOS" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
        </motion.div>
      </div>

      {/* Floating social platform cards */}
      {NODES.map((n, i) => (
        <motion.div
          key={n.name}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ top: n.pos.top, left: n.pos.left }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: n.delay }}
        >
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-none shadow-[0_4px_16px_rgba(0,0,0,0.1)] pl-1.5 pr-3 py-1.5">
            <div
              className={cn(
                "w-8 h-8 rounded-none flex items-center justify-center shrink-0 [&_svg]:w-4 [&_svg]:h-4",
                n.bg
              )}
            >
              {n.icon}
            </div>
            <span className="text-[12px] font-semibold text-[#1A1A1A] dark:text-neutral-200 whitespace-nowrap">
              {n.name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
