import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Filter,
  ArrowRight,
  Clock,
  ChevronDown,
  Layers,
  Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  XIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  FacebookIcon 
} from "@/components/PlatformIcons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  setMonth 
} from "date-fns";

type ViewMode = "month" | "week";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Default to May 2026 for demo
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ date: Date; posts: any[] } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Mock platforms
  const platforms = [
    { name: 'x', icon: XIcon },
    { name: 'linkedin', icon: LinkedInIcon },
    { name: 'instagram', icon: InstagramIcon },
    { name: 'facebook', icon: FacebookIcon }
  ];

  // Generate calendar grid days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate week days
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [posts, setPosts] = useState(() => {
    const initialPosts = Array.from({ length: 20 }).map((_, i) => ({
      id: `post-${i}`,
      date: new Date(2026, 4, 18),
      time: `${9 + Math.floor(i/4)}:${(i % 4) * 15 === 0 ? '00' : (i % 4) * 15} ${9 + Math.floor(i/4) >= 12 ? 'PM' : 'AM'}`,
      platform: platforms[i % 4],
      handle: i % 2 === 0 ? "@johndoe" : "@acme_global",
      avatar: i % 2 === 0 ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' : 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      content: i % 3 === 0 ? "Building the future of social management with AI-first architecture. #SaaS #AI" : "Consistency is the key to growth. Keep posting, keep building."
    }));

    for (let i = 1; i <= 31; i++) {
      const d = new Date(2026, 4, i);
      if (i !== 18) { 
        if (i % 7 === 0) {
          initialPosts.push({ id: `sparse-7-${i}`, date: d, handle: "@acmecorp", time: "11:00 AM", platform: platforms[1], avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop', content: "Weekly update on development progress." });
        }
        if (i % 3 === 0) {
          initialPosts.push({ id: `sparse-3a-${i}`, date: d, handle: "@johndoe", time: "10:00 AM", platform: platforms[0], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', content: "Morning thoughts on product development." });
          initialPosts.push({ id: `sparse-3b-${i}`, date: d, handle: "@acme_global", time: "3:00 PM", platform: platforms[2], avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop', content: "Behind the scenes at Acme HQ." });
        }
      }
    }
    return initialPosts;
  });

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => isSameDay(post.date, date));
  };

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("postId", postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData("postId");
    if (!postId) return;

    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, date: targetDate } : post
      )
    );
  };

  const openDayDetails = (date: Date, posts: any[]) => {
    if (posts.length > 0) {
      setSelectedDayDetails({ date, posts });
      setIsModalOpen(true);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToMonth = (monthIndex: number) => setCurrentDate(setMonth(currentDate, monthIndex));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const handlePrev = () => viewMode === "month" ? prevMonth() : prevWeek();
  const handleNext = () => viewMode === "month" ? nextMonth() : nextWeek();

  const getHeaderLabel = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    }
    return `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Operations / Strategy</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Calendar</h1>
        </div>
        <div className="flex items-center gap-3">

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/20 border border-border p-1">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "h-10 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-none",
                viewMode === "month" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "h-10 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-none",
                viewMode === "week" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Week
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center bg-muted/20 border border-border p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrev}
              className="h-10 w-10 rounded-none hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {viewMode === "month" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-6 text-[10px] font-black uppercase tracking-[0.3em] h-10 rounded-none hover:bg-muted flex items-center gap-2">
                    {getHeaderLabel()}
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-none border-border bg-card w-48 p-1 shadow-2xl">
                  {months.map((month, index) => (
                    <DropdownMenuItem 
                      key={month}
                      onClick={() => goToMonth(index)}
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-none focus:bg-foreground focus:text-background transition-colors cursor-pointer",
                        currentDate.getMonth() === index && "bg-muted"
                      )}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="px-6 text-[10px] font-black uppercase tracking-[0.3em] h-10 flex items-center">
                {getHeaderLabel()}
              </span>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNext}
              className="h-10 w-10 rounded-none hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button className="h-12 rounded-none bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-[0.2em] text-[10px] px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* ===================== MONTH VIEW ===================== */}
      {viewMode === "month" && (
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {days.map((day) => (
              <div key={day} className="py-4 text-center border-r border-border last:border-r-0">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 h-full">
            {calendarDays.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, monthStart);
              const dayPosts = getPostsForDay(date);

              return (
                <div 
                  key={date.toString()} 
                  onClick={() => isCurrentMonth && openDayDetails(date, dayPosts)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-b border-border transition-all relative flex flex-col min-w-0 group h-[160px] overflow-hidden",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth && "bg-muted/5 opacity-40",
                    isCurrentMonth && "hover:bg-muted/10 cursor-pointer",
                    isCurrentMonth && dayPosts.length > 0 && "bg-primary/[0.03]"
                  )}
                >
                  {/* Date Number */}
                  <div className="p-2 flex justify-between items-start">
                    <span className={cn(
                      "text-[10px] font-black tracking-widest transition-all",
                      isToday ? "bg-foreground text-background w-5 h-5 flex items-center justify-center" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {format(date, "d")}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/create-post', { state: { date: date.toISOString() } });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background rounded-none border-border"
                      title={`Create post on ${format(date, "MMM d, yyyy")}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Content Area - Avatar Squares */}
                  <div className="flex-1 px-1.5 pb-2">
                    <div className="flex flex-wrap gap-1">
                      {dayPosts.slice(0, 8).map((post) => (
                        <div 
                          key={post.id} 
                          className="group/post relative"
                          title={`${post.handle} - ${post.time}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, post.id)}
                        >
                          <div className="w-6 h-6 flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0 hover:border-foreground transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {post.avatar ? (
                              <img src={post.avatar} alt={post.handle} className="w-full h-full object-cover opacity-90 group-hover/post:opacity-100" />
                            ) : (
                              <span className="text-[8px] font-black text-muted-foreground">{post.handle.charAt(1).toUpperCase()}</span>
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                              <post.platform.icon className="w-1.5 h-1.5 text-foreground" />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* More Indicator */}
                      {dayPosts.length > 8 && (
                        <div className="w-6 h-6 flex items-center justify-center bg-muted/30 border border-dashed border-border hover:bg-muted transition-colors cursor-pointer" title={`${dayPosts.length - 8} more posts`}>
                          <span className="text-[8px] font-black text-muted-foreground">
                            +{dayPosts.length - 8}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ===================== WEEK VIEW ===================== */}
      {viewMode === "week" && (
        <Card className="border border-border bg-card shadow-none rounded-none overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              return (
                <div key={date.toString()} className="py-4 text-center border-r border-border last:border-r-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">{format(date, "EEE")}</span>
                  <div className={cn(
                    "text-lg font-black mt-1 tracking-tight",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {format(date, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Grid - tall columns */}
          <div className="grid grid-cols-7">
            {weekDays.map((date) => {
              const isToday = isSameDay(date, new Date());
              const dayPosts = getPostsForDay(date);

              return (
                <div 
                  key={date.toString()} 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  className={cn(
                    "border-r border-border last:border-r-0 min-h-[480px] flex flex-col relative group",
                    dayPosts.length > 0 ? "bg-primary/[0.03]" : "",
                    isToday && "bg-primary/[0.05]"
                  )}
                >
                  {/* Plus Button */}
                  <div className="p-2 flex justify-end">
                    <button 
                      onClick={() => navigate('/create-post', { state: { date: date.toISOString() } })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background"
                      title={`Create post on ${format(date, "MMM d, yyyy")}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Posts List */}
                  <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {dayPosts.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center px-2">
                        <div className="w-8 h-8 border border-dashed border-border flex items-center justify-center mb-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/30" />
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">No posts</span>
                      </div>
                    )}
                    {dayPosts.map((post) => (
                      <div 
                        key={post.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        className="group/post p-2.5 border border-border bg-background hover:border-foreground/30 transition-all cursor-pointer"
                        onClick={() => openDayDetails(date, dayPosts)}
                      >
                        {/* Account Square + Time */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 flex items-center justify-center relative border border-border overflow-hidden bg-muted flex-shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]">
                            {post.avatar ? (
                              <img src={post.avatar} alt={post.handle} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-black text-muted-foreground">{post.handle.charAt(1).toUpperCase()}</span>
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border-t border-l border-border flex items-center justify-center">
                              <post.platform.icon className="w-1.5 h-1.5 text-foreground" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-black uppercase tracking-tight text-foreground truncate">{post.handle}</div>
                            <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground">
                              <Clock className="w-2 h-2" />
                              {post.time}
                            </div>
                          </div>
                        </div>
                        {/* Content Preview */}
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Day Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-none border-border shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-foreground" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                {selectedDayDetails && format(selectedDayDetails.date, "MMMM d, yyyy")}
              </span>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Scheduled Queue</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {selectedDayDetails?.posts.map((post) => (
              <div key={post.id} className="group/item flex flex-col border border-border hover:border-foreground/20 transition-all p-4 bg-card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background">
                      <post.platform.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-foreground">{post.handle}</div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <Clock className="w-2.5 h-2.5" />
                        {post.time}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="h-8 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">
                    Edit Post
                  </Button>
                </div>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {post.content}
                </p>
                <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors flex items-center gap-2">
                    Action Required
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default Calendar;
