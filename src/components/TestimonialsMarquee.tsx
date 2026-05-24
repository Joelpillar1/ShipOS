import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const col1 = [
  {
    name: "Stuart Brent",
    role: "Founder at Swvo/dfb (B2B)",
    quote: "ShipOS is solving the hardest problem in outbound:\n\nFinding high-intent leads, people who are already in the market, searching for what you offer, and ready to engage.",
    avatar: "https://i.pravatar.cc/150?u=stuart",
    authorTop: false
  },
  {
    name: "David Kim",
    role: "Startup Founder",
    quote: "The unified inbox and analytics mean I don't have to context-switch. My SaaS launch got double the visibility because I could schedule everything flawlessly.",
    avatar: "https://i.pravatar.cc/150?u=david",
    authorTop: false
  }
];

const col2 = [
  {
    name: "Nathan Amram",
    role: "Growth Automation Manager @Minifllo",
    quote: "With ShipOS we track people engaging with our competitors and it's bringing in some of our best leads. It's like having a radar for high-intent prospects.",
    avatar: "https://i.pravatar.cc/150?u=nathan",
    authorTop: true
  },
  {
    name: "Jessica Lee",
    role: "Social Media Manager",
    quote: "Managing 5 brand accounts used to be a nightmare. ShipOS makes it feel like I'm playing a video game. The bulk scheduling is just ridiculously good.",
    avatar: "https://i.pravatar.cc/150?u=jess",
    authorTop: true
  }
];

const col3 = [
  {
    name: "Maxime Le Morillon",
    role: "Head of Sales (Marketing Agency)",
    quote: "The best part of ShipOS is predictability : every week we know we'll have a fresh batch of warm leads to work. It takes the stress out of outbound.\n\nWe used to waste hours.",
    avatar: "https://i.pravatar.cc/150?u=maxime",
    authorTop: false
  },
  {
    name: "Sarah Chen",
    role: "Tech Creator",
    quote: "ShipOS turned my random threads into viral showcases. The AI writer widget types hook optimizations that represent my authentic voice perfectly.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    authorTop: false
  }
];

const TestimonialBlock = ({ t }: { t: any }) => (
  <div className="flex flex-col gap-6 text-left mb-8 border border-gray-200 p-8 rounded-none bg-white w-[350px]">
    {t.authorTop && (
      <div className="flex items-center gap-4">
        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-none object-cover" />
        <div>
          <div className="text-[15px] font-bold text-[#1c2024] leading-tight mb-0.5">{t.name}</div>
          <div className="text-[13px] text-gray-500 font-medium">{t.role}</div>
        </div>
      </div>
    )}

    <div className="flex space-x-1 text-[#d75a34]">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-current stroke-current" />
      ))}
    </div>
    
    <div className="text-[16px] text-[#4b5563] leading-relaxed whitespace-pre-wrap font-medium">
      {t.quote}
    </div>

    {!t.authorTop && (
      <div className="flex items-center gap-4">
        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-none object-cover" />
        <div>
          <div className="text-[15px] font-bold text-[#1c2024] leading-tight mb-0.5">{t.name}</div>
          <div className="text-[13px] text-gray-500 font-medium">{t.role}</div>
        </div>
      </div>
    )}
  </div>
);

export const TestimonialsMarquee: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden flex justify-center gap-8 px-6 h-[800px]">
      {/* Top and Bottom Fading Masks */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

      <motion.div 
        className="flex flex-col h-max"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...col1, ...col1, ...col1, ...col1].map((t, idx) => <TestimonialBlock key={idx} t={t} />)}
      </motion.div>
      <motion.div 
        className="flex flex-col h-max"
        animate={{ y: ["-50%", "0%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {[...col2, ...col2, ...col2, ...col2].map((t, idx) => <TestimonialBlock key={idx} t={t} />)}
      </motion.div>
      <motion.div 
        className="flex flex-col h-max"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {[...col3, ...col3, ...col3, ...col3].map((t, idx) => <TestimonialBlock key={idx} t={t} />)}
      </motion.div>
    </div>
  );
};
