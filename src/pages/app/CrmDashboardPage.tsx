import { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { PlusCircle, ArrowRight, Users, Database, Activity } from 'lucide-react';
import type { CrmApp, Module } from '@shared/saas-types';

interface CrmStats {
    totalRecords: number;
    totalUsers: number;
    moduleStats: { moduleId: string; moduleName: string; recordCount: number }[];
    recentRecords: { id: string; moduleId: string; data: Record<string, unknown>; createdAt: number }[];
}

export default function CrmDashboardPage() {
    const { appId } = useParams<{ appId: string }>();
    const context = useOutletContext<{ app?: CrmApp; modules?: Module[] }>();
    const [stats, setStats] = useState<CrmStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (appId) {
            setIsLoading(true);
            api<CrmStats>(`/api/saas/apps/${appId}/stats`)
                .then(setStats)
                .catch(err => console.error("Failed to load stats:", err))
                .finally(() => setIsLoading(false));
        }
    }, [appId]);

    const app = context?.app;
    const modules = context?.modules || [];
    const primaryColor = app?.branding?.primaryColor || '#6366f1';

    const getModuleName = (moduleId: string) => {
        return modules.find(m => m.id === moduleId)?.displayName || 'Unknown';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {app?.name || 'CRM Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        Overview of your CRM data and activity
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Across all modules</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Active users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Modules</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{modules.length}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Active modules</p>
                    </CardContent>
                </Card>
            </div>

            {/* Module Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Records by Module</CardTitle>
                    <CardDescription>Click a module to view its records</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : stats?.moduleStats?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No modules with records yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {stats?.moduleStats?.map(stat => {
                                const module = modules.find(m => m.id === stat.moduleId);
                                return (
                                    <Link
                                        key={stat.moduleId}
                                        to={`/app/${appId}/module/${stat.moduleId}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: module?.color || primaryColor }}
                                            />
                                            <span className="font-medium">{stat.moduleName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">
                                                {stat.recordCount} records
                                            </span>
                                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {modules.slice(0, 4).map(module => (
                            <Link key={module.id} to={`/app/${appId}/module/${module.id}`}>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <PlusCircle className="h-4 w-4" style={{ color: module.color }} />
                                    Add {module.displayName.replace(/s$/, '')}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Records */}
            {stats?.recentRecords && stats.recentRecords.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest records added to your CRM</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentRecords.slice(0, 5).map(record => (
                                <Link
                                    key={record.id}
                                    to={`/app/${appId}/record/${record.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <div>
                                            <p className="font-medium">
                                                {(record.data.name as string) ||
                                                    (record.data.title as string) ||
                                                    `Record ${record.id.substring(0, 8)}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {getModuleName(record.moduleId)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
