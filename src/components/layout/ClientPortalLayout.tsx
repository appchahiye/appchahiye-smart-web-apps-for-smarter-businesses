import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FolderArchive,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
export function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const { clientId } = useParams();
  const navItems = [
    { href: `/portal/${clientId}`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/portal/${clientId}/projects`, icon: FileText, label: "Projects" },
    { href: `/portal/${clientId}/invoices`, icon: FileText, label: "Invoices" },
    { href: `/portal/${clientId}/files`, icon: FolderArchive, label: "Files" },
    { href: `/portal/${clientId}/account`, icon: User, label: "Account" },
  ];
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col h-full">
          <div className="flex h-16 items-center border-b px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
              <div className="h-6 w-6 rounded-md bg-gradient-brand" />
              <span className="">AppChahiye</span>
            </NavLink>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map(({ href, icon: Icon, label }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={href.endsWith(clientId ?? '')}
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
          </div>
          <div className="mt-auto p-4">
             <Button variant="ghost" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
             </Button>
          </div>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="sm:hidden">
                {/* Mobile Nav Trigger can go here */}
            </div>
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Welcome back, Client! 👋</h1>
            </div>
            <Button variant="outline" size="icon">
                <MessageSquare className="h-5 w-5" />
            </Button>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}