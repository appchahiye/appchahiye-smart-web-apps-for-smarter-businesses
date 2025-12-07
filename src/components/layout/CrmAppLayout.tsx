import React, { useState, useEffect } from "react";
import { NavLink, useParams, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Settings,
    Users,
    LogOut,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { CrmApp, Module, Pillar } from "@shared/saas-types";

// Icon mapping for pillars
const PILLAR_ICONS: Record<string, React.ReactNode> = {
    people: <span className="text-base">👥</span>,
    work: <span className="text-base">💼</span>,
    money: <span className="text-base">💰</span>,
    stock: <span className="text-base">📦</span>,
    time: <span className="text-base">🕐</span>,
    places: <span className="text-base">📍</span>,
    files: <span className="text-base">📁</span>,
    talk: <span className="text-base">💬</span>,
    reports: <span className="text-base">📊</span>,
    settings: <span className="text-base">⚙️</span>,
};

const PILLAR_NAMES: Record<Pillar, string> = {
    people: 'People',
    work: 'Work',
    money: 'Money',
    stock: 'Stock',
    time: 'Time',
    places: 'Places',
    files: 'Files',
    talk: 'Talk',
    reports: 'Reports',
    settings: 'Settings',
};

interface AppData {
    app: CrmApp;
    modules: Module[];
}

export function CrmAppLayout() {
    const { appId } = useParams<{ appId: string }>();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (appId) {
            setIsLoading(true);
            api<AppData>(`/api/saas/apps/${appId}`)
                .then(setAppData)
                .catch(err => console.error("Failed to load CRM app:", err))
                .finally(() => setIsLoading(false));
        }
    }, [appId]);

    // Group modules by pillar
    const modulesByPillar = appData?.modules.reduce((acc, module) => {
        if (!acc[module.pillar]) {
            acc[module.pillar] = [];
        }
        acc[module.pillar].push(module);
        return acc;
    }, {} as Record<Pillar, Module[]>) || {};

    const handleBackToPortal = () => {
        navigate('/');
    };

    const primaryColor = appData?.app.branding.primaryColor || '#6366f1';

    return (
        <div className="flex min-h-screen w-full bg-gradient-soft-light dark:bg-gradient-soft-dark">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-10 flex flex-col border-r border-border/50 transition-all duration-300",
                    "bg-gradient-to-b from-background via-background to-muted/30 backdrop-blur-xl",
                    isCollapsed ? "w-[72px]" : "w-64"
                )}
            >
                {/* App Header */}
                <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            ) : (
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                    style={{
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 4px 20px -4px ${primaryColor}50`
                                    }}
                                >
                                    {appData?.app.name.charAt(0) || 'C'}
                                </div>
                            )}
                            {isLoading ? (
                                <Skeleton className="h-5 w-24" />
                            ) : (
                                <span className="font-semibold truncate">
                                    {appData?.app.name}
                                </span>
                            )}
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-auto py-4 scrollbar-hide">
                    {/* Dashboard Link */}
                    <div className="px-3 mb-4">
                        <NavLink
                            to={`/app/${appId}`}
                            end
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5",
                                    isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 shadow-sm",
                                    isCollapsed && "justify-center px-2"
                                )
                            }
                        >
                            <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <LayoutDashboard className="h-4 w-4" style={{ color: primaryColor }} />
                            </div>
                            {!isCollapsed && <span className="font-medium">Dashboard</span>}
                        </NavLink>
                    </div>

                    {/* Modules by Pillar */}
                    {isLoading ? (
                        <div className="space-y-2 px-3">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-10 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        Object.entries(modulesByPillar).map(([pillar, modules]) => (
                            <div key={pillar} className="mb-4">
                                {!isCollapsed && (
                                    <div className="px-4 mb-2 flex items-center gap-2">
                                        <span className="text-sm">{PILLAR_ICONS[pillar]}</span>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {PILLAR_NAMES[pillar as Pillar]}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1 px-3">
                                    {modules.map(module => (
                                        <NavLink
                                            key={module.id}
                                            to={`/app/${appId}/module/${module.id}`}
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5",
                                                    isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 font-medium shadow-sm",
                                                    isCollapsed && "justify-center px-2"
                                                )
                                            }
                                            title={module.displayName}
                                        >
                                            <div
                                                className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                                style={{
                                                    backgroundColor: module.color,
                                                    ringColor: `${module.color}30`
                                                }}
                                            />
                                            {!isCollapsed && (
                                                <span className="truncate">{module.displayName}</span>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </nav>

                {/* Footer */}
                <div className="border-t border-border/50 p-3 space-y-1">
                    <NavLink
                        to={`/app/${appId}/users`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5",
                                isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 font-medium",
                                isCollapsed && "justify-center px-2"
                            )
                        }
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                            <Users className="h-4 w-4" />
                        </div>
                        {!isCollapsed && <span>Users</span>}
                    </NavLink>
                    <NavLink
                        to={`/app/${appId}/settings`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/5",
                                isActive && "bg-gradient-to-r from-primary/15 to-purple-500/10 font-medium",
                                isCollapsed && "justify-center px-2"
                            )
                        }
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                            <Settings className="h-4 w-4" />
                        </div>
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 text-sm text-muted-foreground",
                            "hover:text-destructive hover:bg-destructive/10",
                            isCollapsed && "justify-center"
                        )}
                        onClick={handleBackToPortal}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                            <LogOut className="h-4 w-4" />
                        </div>
                        {!isCollapsed && <span>Back to Portal</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300",
                    isCollapsed ? "ml-[72px]" : "ml-64"
                )}
            >
                <div className="animate-fade-in">
                    <Outlet context={{ app: appData?.app, modules: appData?.modules }} />
                </div>
            </main>
        </div>
    );
}

// Hook to access CRM context in child routes
export function useCrmApp() {
    const { app, modules } = React.useContext(React.createContext<{
        app?: CrmApp;
        modules?: Module[];
    }>({}));
    return { app, modules };
}
