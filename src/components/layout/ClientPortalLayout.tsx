import React, { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  LogOut,
  Receipt,
  Grid3X3,
  PlusCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/ChatInterface";
import { api } from "@/lib/api-client";
import type { ClientProfile } from "@shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLogo } from "../AppLogo";
import { useContentStore } from "@/stores/contentStore";
import { useDynamicAssets } from "@/hooks/use-dynamic-assets";

export function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { content, fetchContent } = useContentStore();

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useDynamicAssets(content?.brandAssets, content?.seoMetadata);

  useEffect(() => {
    if (clientId) {
      setIsLoadingProfile(true);
      api<ClientProfile>(`/api/portal/${clientId}/account`)
        .then(setProfile)
        .catch(err => console.error("Failed to load client profile", err))
        .finally(() => setIsLoadingProfile(false));
    }
  }, [clientId]);

  const ADMIN_USER_ID = 'admin-user-01';

  const navItems = [
    { href: `/portal/${clientId || ''}`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/portal/${clientId || ''}/my-crms`, icon: Grid3X3, label: "My CRMs" },
    { href: `/portal/${clientId || ''}/create-crm`, icon: PlusCircle, label: "Create CRM", highlight: true },
    { href: `/portal/${clientId || ''}/invoices`, icon: Receipt, label: "Invoices" },
    { href: `/portal/${clientId || ''}/billing`, icon: CreditCard, label: "Billing" },
    { href: `/portal/${clientId || ''}/account`, icon: User, label: "Account" },
  ];

  const handleLogout = () => {
    navigate('/portal/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-soft-light dark:bg-gradient-soft-dark">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col sm:flex">
        <div className="flex flex-col h-full border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur-xl">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/50 px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold group">
              <AppLogo />
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map(({ href, icon: Icon, label, highlight }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={href.endsWith(clientId ?? '')}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5",
                      isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 text-primary shadow-sm",
                      !isActive && "text-muted-foreground",
                      highlight && !isActive && "text-primary"
                    )
                  }
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    highlight ? "bg-gradient-brand text-white" : "bg-muted/50"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {label}
                  {highlight && (
                    <Sparkles className="h-3 w-3 ml-auto text-amber-500" />
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Logout */}
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
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
          <div className="sm:hidden">
            {/* Mobile Nav Trigger */}
          </div>
          <div className="flex-1">
            {isLoadingProfile ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <div>
                <h1 className="text-lg font-semibold">
                  Welcome back, {profile?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Manage your CRM applications and account
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isLoadingProfile ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
                <AvatarFallback className="bg-gradient-brand text-white font-medium">
                  {profile?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Chat FAB */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-glow-primary hover:shadow-glow-xl hover:scale-105 transition-all duration-300"
            variant="gradient"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l-0">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              Chat with Support
            </SheetTitle>
          </SheetHeader>
          {clientId && (
            <ChatInterface
              clientId={clientId}
              currentUserId={clientId}
              receiverId={ADMIN_USER_ID}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}