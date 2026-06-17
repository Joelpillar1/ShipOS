import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 relative overflow-y-auto">
            {/* Mobile trigger to toggle sidebar */}
            <SidebarTrigger className="md:hidden fixed top-3 left-3 z-50 h-9 w-9 bg-card border border-border rounded-none shadow-md text-muted-foreground hover:text-foreground" />
            
            <div className="w-full h-full animate-in fade-in duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
