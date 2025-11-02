import React from "react";
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
  Briefcase,
  LogOut,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/content", icon: FileText, label: "Content" },
  { href: "/admin/leads", icon: Users, label: "Leads / Clients" },
  { href: "/admin/invoices", icon: Receipt, label: "Invoices" },
  { href: "/admin/chat", icon: MessageSquare, label: "Chat" },
  { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];
const NavContent = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/admin" className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded-md bg-gradient-brand" />
          <span className="">AppChahiye Admin</span>
        </NavLink>
      </div>
      <nav className="flex-1 grid items-start gap-1 p-4 text-sm font-medium">
        {navItems.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/admin'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <NavContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search or other header items here */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}