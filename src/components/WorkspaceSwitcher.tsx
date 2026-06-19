import React, { useState, useContext } from 'react';
import { useWorkspace, Workspace } from '@/context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/components/AuthProvider';
import { useSidebar } from '@/components/ui/sidebar';
import { WorkspaceIcon, WORKSPACE_ICONS } from '@/components/WorkspaceIcons';
import { 
  ChevronDown, 
  Plus, 
  Check, 
  Briefcase, 
  Settings,
  FolderOpen,
  Upload,
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, isSwitching } = useWorkspace();
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const { state } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  // Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [logoUrl, setLogoUrl] = useState('rocket');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Workspace name is required.',
        variant: 'warning',
      });
      return;
    }
    try {
      const newWs = await createWorkspace(newWsName.trim(), '#d75a34', undefined, logoUrl);
      toast({
        title: 'Workspace Created',
        description: `Workspace "${newWs.name}" has been successfully created.`,
      });
      setNewWsName('');
      setLogoUrl('rocket');
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      const isLimitError = err?.message?.toLowerCase().includes('limit');
      if (isLimitError) {
        toast({
          title: "WORKSPACE LIMIT REACHED",
          description: err?.message || "You have reached your workspace limit. Please upgrade your subscription to create additional workspaces.",
          variant: "warning",
          action: (
            <ToastAction 
              altText="Upgrade Plan" 
              onClick={() => navigate('/settings?tab=plans')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-none border-none font-black uppercase tracking-wider text-[9px] h-9 px-4 shrink-0"
            >
              Upgrade Plan
            </ToastAction>
          )
        });
      } else {
        toast({
          title: 'Error',
          description: err?.message || 'Failed to create workspace.',
          variant: 'destructive',
        });
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <div className={cn("py-1.5 px-4 w-full flex items-center justify-between", isCollapsed && "p-1 justify-center")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-between text-left bg-background hover:bg-sidebar-accent/50 rounded-none border border-border focus-visible:ring-0 select-none transition-all",
                isCollapsed ? "justify-center p-0 w-8 h-8" : "px-2 py-1 h-8 gap-2"
              )}
            >
              {isCollapsed ? (
                /* Collapsed: show workspace icon only */
                <div className={cn("transition-opacity duration-200", isSwitching && "opacity-40")}>
                  <WorkspaceIcon
                    logoUrl={activeWorkspace.logoUrl}
                    color={activeWorkspace.color}
                    name={activeWorkspace.name}
                    className="w-6 h-6 rounded-none shrink-0"
                    iconClassName="w-3 h-3"
                  />
                </div>
              ) : (
                /* Expanded: icon + name side by side */
                <>
                  <div className={cn("flex items-center gap-2 flex-1 min-w-0 transition-opacity duration-200", isSwitching && "opacity-40")}>
                    <WorkspaceIcon
                      logoUrl={activeWorkspace.logoUrl}
                      color={activeWorkspace.color}
                      name={activeWorkspace.name}
                      className="w-6 h-6 rounded-none shrink-0"
                      iconClassName="w-3 h-3"
                    />
                    <span className="flex-1 min-w-0 text-[10px] font-black text-foreground uppercase tracking-wider truncate flex items-center gap-1.5">
                      <span className="truncate">{activeWorkspace.name}</span>
                      {activeWorkspace.ownerId && activeWorkspace.ownerId !== user?.id && (
                        <span className="px-1.5 py-0.5 text-[7px] font-black bg-[#FF6154]/15 text-[#FF6154] uppercase tracking-wide shrink-0">Invited</span>
                      )}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            className="w-64 p-2 bg-background border-2 border-border rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] z-50" 
            align={isCollapsed ? "left" : "start"}
            side="bottom"
            sideOffset={6}
          >
            <DropdownMenuLabel className="px-3 py-2 text-[8px] font-black text-muted-foreground/50 tracking-[0.2em] uppercase">
              Workspaces ({workspaces.length})
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border my-1" />

            <div className="max-h-60 overflow-y-auto custom-scrollbar my-1 p-0.5 space-y-0.5">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => setActiveWorkspace(ws.id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-none focus:bg-foreground/[0.04] focus:text-foreground cursor-pointer transition-all",
                      isActive ? "bg-sidebar-accent/50" : ""
                    )}
                  >
                    <WorkspaceIcon
                      logoUrl={ws.logoUrl}
                      color={ws.color}
                      name={ws.name}
                      className="w-6 h-6 rounded-none shrink-0"
                      iconClassName="w-3 h-3"
                    />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                      <span className={cn("text-[10px] uppercase tracking-wide truncate", isActive ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                        {ws.name}
                      </span>
                      {ws.ownerId && ws.ownerId !== user?.id && (
                        <span className="px-1.5 py-0.5 text-[7px] font-black bg-[#FF6154]/15 text-[#FF6154] uppercase tracking-wide shrink-0">Invited</span>
                      )}
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 stroke-[3]" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator className="bg-border my-1.5" />

            {/* Create Workspace Trigger */}
            <DropdownMenuItem
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-3 p-2 rounded-none focus:bg-foreground/[0.04] focus:text-foreground cursor-pointer text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[9px]"
            >
              <div className="w-6 h-6 border border-dashed border-border flex items-center justify-center bg-muted/20 shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-none border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm z-50">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-border">
                <FolderOpen className="w-4 h-4 text-primary" />
                New Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium pt-3 text-left">
                Workspaces separate your social accounts, queues, templates, and analytics to keep client work or side projects isolated.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-left">
              {/* Workspace Icon Selector */}
              <div className="space-y-1.5 flex flex-col pb-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-wider text-foreground">
                  Workspace Icon
                </Label>
                <div className="flex items-center gap-4 my-2">
                  <WorkspaceIcon
                    logoUrl={logoUrl}
                    color="#d75a34"
                    name={newWsName || 'Workspace'}
                    className="w-12 h-12 rounded-none"
                    iconClassName="w-6 h-6"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Preview</span>
                </div>
                
                <div className="grid grid-cols-6 gap-2 p-2.5 border-2 border-border bg-background max-h-[120px] overflow-y-auto custom-scrollbar w-full">
                  {Object.entries(WORKSPACE_ICONS).map(([key, IconComponent]) => {
                    const isSelected = logoUrl === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLogoUrl(key)}
                        className={cn(
                          "aspect-square p-2 border flex items-center justify-center transition-all hover:bg-muted active:scale-95",
                          isSelected 
                            ? "border-foreground bg-foreground/5 font-black ring-1 ring-foreground" 
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                        title={key}
                      >
                        <IconComponent className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workspace Name */}
              <div className="space-y-1.5">
                <Label htmlFor="ws-name" className="text-[10px] font-black uppercase tracking-wider text-foreground">
                  Workspace Name
                </Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Acme Agency or Personal Brand"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="rounded-none border-2 border-border bg-background font-bold text-xs h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-4 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-none border-2 border-border font-black uppercase tracking-wider text-[10px] h-10 px-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-wider text-[10px] h-10 px-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
