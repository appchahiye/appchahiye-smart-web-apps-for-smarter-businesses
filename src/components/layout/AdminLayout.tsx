import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  Users,
  LineChart,
  Settings,
  PanelLeft,
  MessageSquare,
  LogOut,
  Receipt,
  ClipboardList,
  Briefcase,
  Building2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { AppLogo } from "../AppLogo";
import { useContentStore } from "@/stores/contentStore";
import { useDynamicAssets } from "@/hooks/use-dynamic-assets";

const navItems = [
  { href: "/yenahimilna", icon: Home, label: "Dashboard" },
  { href: "/yenahimilna/content", icon: FileText, label: "Content" },
  { href: "/yenahimilna/leads", icon: Users, label: "Leads / Clients" },
  { href: "/yenahimilna/invoices", icon: Receipt, label: "Invoices" },
  { href: "/yenahimilna/services", icon: Briefcase, label: "Services" },
  { href: "/yenahimilna/workspaces", icon: Building2, label: "Workspaces" },
  { href: "/yenahimilna/crm-apps", icon: LayoutGrid, label: "CRM Apps" },
  { href: "/yenahimilna/chat", icon: MessageSquare, label: "Chat" },
  { href: "/yenahimilna/forms", icon: ClipboardList, label: "Filled Forms" },
  { href: "/yenahimilna/analytics", icon: LineChart, label: "Analytics" },
  { href: "/yenahimilna/settings", icon: Settings, label: "Settings" },
];

const NavContent = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/yenahimilna/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-border/50 px-6">
        <NavLink to="/yenahimilna" className="flex items-center gap-2 font-semibold group">
          <AppLogo />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-4 text-sm font-medium overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/yenahimilna'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200",
                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5 hover:text-foreground",
                isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 text-primary font-medium shadow-sm"
              )
            }
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              "bg-muted/50 group-hover:bg-primary/10"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
            <LogOut className="h-4 w-4" />
          </div>
          Logout
        </Button>
      </div>
    </div>
  );
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { content, fetchContent } = useContentStore();

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useDynamicAssets(content?.brandAssets, content?.seoMetadata);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-[280px] border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur-xl">
          <NavContent />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 lg:h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r-0">
              <div className="h-full bg-gradient-to-b from-background to-muted/30">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Header content area */}
          <div className="w-full flex-1 flex items-center justify-between">
            <div className="hidden md:block">
              {/* Breadcrumb or page title can go here */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-6 p-6 md:p-8 bg-gradient-soft-light dark:bg-gradient-soft-dark">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}