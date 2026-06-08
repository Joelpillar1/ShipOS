import React from 'react';
import { 
  Home,
  Briefcase, 
  Building2, 
  Rocket, 
  Terminal, 
  Compass, 
  Target, 
  Globe, 
  Zap, 
  Award, 
  Star, 
  Heart, 
  Sparkles, 
  Palette, 
  Lightbulb, 
  Coffee, 
  MessageSquare,
  Activity,
  Cpu,
  Cloud,
  Flame,
  Users,
  LayoutGrid,
  BookOpen,
  Bookmark
} from 'lucide-react';

export const WORKSPACE_ICONS = {
  home: Home,
  rocket: Rocket,
  briefcase: Briefcase,
  building: Building2,
  terminal: Terminal,
  compass: Compass,
  target: Target,
  globe: Globe,
  zap: Zap,
  award: Award,
  star: Star,
  heart: Heart,
  sparkles: Sparkles,
  palette: Palette,
  lightbulb: Lightbulb,
  coffee: Coffee,
  message: MessageSquare,
  activity: Activity,
  cpu: Cpu,
  cloud: Cloud,
  flame: Flame,
  users: Users,
  grid: LayoutGrid,
  book: BookOpen,
  bookmark: Bookmark,
};

export type WorkspaceIconKey = keyof typeof WORKSPACE_ICONS;

interface WorkspaceIconProps {
  logoUrl?: string;
  color: string;
  name: string;
  className?: string;
  iconClassName?: string;
}

export const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ 
  logoUrl, 
  color, 
  name, 
  className = "w-6 h-6 shrink-0", 
  iconClassName = "w-3.5 h-3.5" 
}) => {
  // If logoUrl matches one of our icon keys
  if (logoUrl && logoUrl in WORKSPACE_ICONS) {
    const IconComponent = WORKSPACE_ICONS[logoUrl as WorkspaceIconKey];
    return (
      <div 
        className={`${className} flex items-center justify-center border border-border bg-muted/20 text-foreground`}
      >
        <IconComponent className={`${iconClassName} stroke-[2.5]`} />
      </div>
    );
  }
  
  // Backwards compatibility for image URLs / data URIs
  if (logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('data:'))) {
    return (
      <img 
        src={logoUrl} 
        alt={name}
        className={`${className} rounded-none object-cover`}
      />
    );
  }

  // Fallback: initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div 
      className={`${className} flex items-center justify-center font-black text-foreground text-[9px] border border-border bg-muted/20`}
    >
      {initials || 'WS'}
    </div>
  );
};
