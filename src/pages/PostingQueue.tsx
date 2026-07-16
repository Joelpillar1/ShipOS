import React, { useState, useEffect } from"react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { useToast } from"@/hooks/use-toast";
import { getQueueSlots, saveQueueSlots, syncQueueSlotsFromServer, QueueSlot, getUserTimezone, saveUserTimezone, getTimezoneOptions } from"@/lib/postStorage";
import { Clock, Plus, Trash2, Check, AlertCircle } from"lucide-react";
import { useTeam } from"@/context/TeamContext";
import { useNavigate } from"react-router-dom";
import { useWorkspace } from"@/context/WorkspaceContext";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";

// Format 24h"HH:MM" to"hh:mm am/pm"
function formatTime12h(time24: string): string {
 const [hStr, mStr] = time24.split(":");
 const h = parseInt(hStr, 10);
 const ampm = h >= 12 ?"pm" :"am";
 const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
 return `${h12}:${mStr} ${ampm}`;
}

// Generate time options for time dropdown
const TIME_DROPDOWN_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
 for (let m = 0; m < 60; m += 30) {
 const hh24 = String(h).padStart(2,"0");
 const mm = String(m).padStart(2,"0");
 const val = `${hh24}:${mm}`;
 const ampm = h >= 12 ?"PM" :"AM";
 const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
 const lbl = `${h12}:${mm} ${ampm}`;
 TIME_DROPDOWN_OPTIONS.push({ value: val, label: lbl });
 }
}

export default function PostingQueue() {
 const { toast } = useToast();
 const { currentUserRole } = useTeam();
 const navigate = useNavigate();
 const { activeWorkspace } = useWorkspace();
 const [slots, setSlots] = useState<QueueSlot[]>([]);
 const [newTime, setNewTime] = useState("12:00");
 const isViewer = currentUserRole ==="viewer";

 useEffect(() => {
 setSlots(getQueueSlots());
 let cancelled = false;
 void syncQueueSlotsFromServer().then((remote) => {
 if (!cancelled) {
 setSlots(remote);
 setTimezone(getUserTimezone());
 }
 });
 return () => { cancelled = true; };
 }, [activeWorkspace.id]);

 const handleToggleDay = (slotId: string, day: keyof QueueSlot["days"]) => {
 if (isViewer) {
 toast({
 title:"Access Restricted",
 description:"Viewers cannot edit the queue schedule.",
 variant:"warning"
 });
 return;
 }

 const updated = slots.map((slot) => {
 if (slot.id === slotId) {
 return {
 ...slot,
 days: {
 ...slot.days,
 [day]: !slot.days[day],
 },
 };
 }
 return slot;
 });

 setSlots(updated);
 saveQueueSlots(updated);
 toast({
 title:"Schedule Updated",
 description:"Posting day preference toggled successfully."
 });
 };

 const handleDeleteSlot = (slotId: string) => {
 if (isViewer) {
 toast({
 title:"Access Restricted",
 description:"Viewers cannot edit the queue schedule.",
 variant:"warning"
 });
 return;
 }

 const updated = slots.filter((s) => s.id !== slotId);
 setSlots(updated);
 saveQueueSlots(updated);
 toast({
 title:"Slot Removed",
 description:"Posting slot deleted successfully."
 });
 };

 const handleAddSlot = (e: React.FormEvent) => {
 e.preventDefault();
 if (isViewer) {
 toast({
 title:"Access Restricted",
 description:"Viewers cannot edit the queue schedule.",
 variant:"warning"
 });
 return;
 }

 // Check if slot already exists
 if (slots.some((s) => s.time === newTime)) {
 toast({
 title:"Slot Exists",
 description: `You already have a posting slot configured for ${formatTime12h(newTime)}.`,
 variant:"warning"
 });
 return;
 }

 const newSlot: QueueSlot = {
 id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
 time: newTime,
 days: {
 mon: true,
 tue: true,
 wed: true,
 thu: true,
 fri: true,
 sat: false,
 sun: false,
 },
 };

 const updated = [...slots, newSlot].sort((a, b) => a.time.localeCompare(b.time));
 setSlots(updated);
 saveQueueSlots(updated);

 toast({
 title:"Slot Added",
 description: `New slot added at ${formatTime12h(newTime)}.`
 });
 };

 // Count active slots: slots * active days
 const activeSlotsCount = slots.reduce((total, slot) => {
 const daysActive = Object.values(slot.days).filter(Boolean).length;
 return total + daysActive;
 }, 0);

 const [timezone, setTimezone] = useState(() => getUserTimezone());
 const timezoneOptions = getTimezoneOptions();

 const handleTimezoneChange = (tz: string) => {
 setTimezone(tz);
 saveUserTimezone(tz);
 toast({
 title:"Timezone Updated",
 description: `Active timezone set to ${tz}.`
 });
 };

 return (
 <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700 max-w-4xl">
 <Card className="border border-border rounded-none shadow-sm bg-card overflow-hidden">
 <CardHeader className="bg-muted/10 border-b border-border py-6">
 <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
 <Clock className="w-5 h-5 text-primary" />
 Queue Schedule
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
 Configure the posting slot blueprint for your workspace queue.
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6 space-y-6">
 {/* Subheaders Info */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
 <div className="space-y-1">
 <p className="text-sm font-bold text-foreground">
 You have <span className="text-primary font-bold">{activeSlotsCount}</span> slots to post during your week.
 </p>
 <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
 <AlertCircle className="w-3.5 h-3.5" />
 Editing your schedule here won't affect posts that are already scheduled.
 </p>
 </div>
 <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
 <Button
 variant="outline"
 onClick={() => navigate("/scheduled")}
 className="h-8 rounded-none text-[10px] font-bold border-border bg-white dark:bg-card hover:bg-muted/10 shrink-0 shadow-none border"
 >
 View Scheduled Posts
 </Button>
 <div className="flex items-center gap-2 max-w-[280px] w-full sm:w-auto">
 <span className="text-[10px] font-bold text-muted-foreground shrink-0">Timezone:</span>
 <Select value={timezone} onValueChange={handleTimezoneChange} disabled={isViewer}>
 <SelectTrigger className="h-8 border-border rounded-none text-[10px] font-bold font-mono px-2.5 bg-white dark:bg-card">
 <SelectValue placeholder="Select Timezone" />
 </SelectTrigger>
 <SelectContent className="rounded-none border border-border bg-card shadow-md max-h-60">
 {timezoneOptions.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-mono">
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Slots Table Grid */}
 {slots.length === 0 ? (
 <div className="flex flex-col justify-center items-center py-12 border border-dashed border-border text-center">
 <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
 <p className="text-sm font-bold text-muted-foreground">No posting slots defined</p>
 <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">Add a posting time slot below to begin scheduling content into a weekly queue.</p>
 </div>
 ) : (
 <div className="border border-border/80 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-center border-collapse">
 <thead>
 <tr className="bg-muted/30 border-b border-border/80">
 <th className="py-3 px-4 text-left text-[9px] font-bold text-muted-foreground w-1/4">Time</th>
 {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
 <th key={d} className="py-3 text-[9px] font-bold text-muted-foreground">{d}</th>
 ))}
 <th className="py-3 text-right pr-6 text-[9px] font-bold text-muted-foreground w-12">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40">
 {slots.map((slot) => (
 <tr key={slot.id} className="hover:bg-muted/10 transition-colors">
 {/* Time Label */}
 <td className="py-4 px-4 text-left font-bold text-sm text-foreground flex items-center gap-2">
 <Clock className="w-4 h-4 text-muted-foreground" />
 <span>{formatTime12h(slot.time)}</span>
 </td>
 {/* Day Circles */}
 {(["mon","tue","wed","thu","fri","sat","sun"] as const).map((day) => {
 const isActive = slot.days[day];
 return (
 <td key={day} className="py-4 align-middle">
 <button
 type="button"
 onClick={() => handleToggleDay(slot.id, day)}
 disabled={isViewer}
 className={`w-6 h-6 rounded-none mx-auto flex items-center justify-center border transition-all ${
 isActive
 ?"bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
 :"border-border/60 text-transparent hover:border-foreground/25"
 }`}
 >
 {isActive && <Check className="w-4 h-4" />}
 </button>
 </td>
 );
 })}
 {/* Delete Action */}
 <td className="py-4 text-right pr-6 align-middle">
 <button
 type="button"
 onClick={() => handleDeleteSlot(slot.id)}
 disabled={isViewer}
 className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
 title="Delete Slot"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Add Time Slot Form */}
 {!isViewer && (
 <form onSubmit={handleAddSlot} className="flex items-center gap-3 pt-4 border-t border-border/50 max-w-sm">
 <div className="flex-1">
 <Select value={newTime} onValueChange={setNewTime}>
 <SelectTrigger className="rounded-none border-border font-mono h-10 bg-white dark:bg-card">
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4 text-muted-foreground" />
 <SelectValue placeholder="Select time" />
 </div>
 </SelectTrigger>
 <SelectContent
 className="rounded-none border border-border bg-card shadow-md max-h-60"
 onCloseAutoFocus={(e) => e.preventDefault()}
 >
 {TIME_DROPDOWN_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <Button
 type="submit"
 className="h-10 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] px-6 shadow-none flex items-center gap-1.5"
 >
 <Plus className="w-4 h-4" />
 Add Time
 </Button>
 </form>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
