import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { ProjectWithMilestones, Invoice, ActivityItem } from '@shared/types';
import type { CrmApp, Tenant } from '@shared/saas-types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Circle, Clock, LayoutGrid, ArrowRight, Sparkles } from 'lucide-react';

export default function ClientDashboardPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // SaaS data
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [crmApps, setCrmApps] = useState<CrmApp[]>([]);
    const [isSaasLoading, setIsSaasLoading] = useState(true);

    // Fetch existing portal data
    useEffect(() => {
        if (clientId) {
            setIsLoading(true);
            Promise.all([
                api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`),
                api<Invoice[]>(`/api/portal/${clientId}/invoices`),
                api<ActivityItem[]>(`/api/portal/${clientId}/activity`),
            ]).then(([projectData, invoiceData, activityData]) => {
                setProjects(projectData);
                setInvoices(invoiceData);
                setActivity(activityData);
            }).catch(err => {
                console.error("Failed to fetch dashboard data:", err);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [clientId]);

    // Fetch SaaS/CRM data
    useEffect(() => {
        if (clientId) {
            setIsSaasLoading(true);
            // First try to get tenant by owner ID
            api<{ tenant: Tenant }>(`/api/saas/tenants/by-owner/${clientId}`)
                .then(data => {
                    setTenant(data.tenant);
                    // Then fetch CRM apps for this tenant
                    return api<{ apps: CrmApp[] }>(`/api/saas/tenants/${data.tenant.id}/apps`);
                })
                .then(appsData => {
                    setCrmApps(appsData.apps);
                })
                .catch(() => {
                    // No tenant yet - that's okay
                    setTenant(null);
                    setCrmApps([]);
                })
                .finally(() => setIsSaasLoading(false));
        }
    }, [clientId]);

    const overallProgress = useMemo(() => {
        if (!projects || projects.length === 0) return 0;
        const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0);
        return Math.round(totalProgress / projects.length);
    }, [projects]);

    const nextMilestone = useMemo(() => {
        if (!projects || projects.length === 0) return null;
        const allMilestones = projects.flatMap(p => p.milestones);
        const upcoming = allMilestones
            .filter(m => m.status !== 'completed' && m.dueDate)
            .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
        return upcoming[0] || null;
    }, [projects]);

    const pendingInvoiceTotal = useMemo(() => {
        return invoices
            .filter(inv => inv.status === 'pending')
            .reduce((sum, inv) => sum + inv.amount, 0);
    }, [invoices]);

    const activityIcons: Record<string, React.ReactNode> = {
        project_created: <CheckCircle className="h-5 w-5 text-primary" />,
        milestone_updated: <Clock className="h-5 w-5 text-blue-500" />,
        milestone_created: <Circle className="h-5 w-5 text-muted-foreground" />,
    };

    return (
        <ClientPortalLayout>
            {/* SaaS CRM Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Your CRM Applications</CardTitle>
                                <CardDescription>
                                    {isSaasLoading
                                        ? 'Loading...'
                                        : crmApps.length > 0
                                            ? `${crmApps.length} active CRM${crmApps.length !== 1 ? 's' : ''}`
                                            : 'Create your first CRM to get started'
                                    }
                                </CardDescription>
                            </div>
                        </div>
                        <Button asChild>
                            <Link to={`/portal/${clientId}/my-crms`}>
                                View All
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isSaasLoading ? (
                        <div className="flex gap-4">
                            <Skeleton className="h-24 w-48" />
                            <Skeleton className="h-24 w-48" />
                        </div>
                    ) : crmApps.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {crmApps.slice(0, 4).map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => navigate(`/app/${app.id}`)}
                                    className="flex-shrink-0 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left min-w-[180px]"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: app.branding?.primaryColor || '#6366f1' }}
                                        >
                                            {app.name.charAt(0)}
                                        </div>
                                        <span className="font-medium">{app.name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {app.businessType} CRM
                                    </p>
                                </button>
                            ))}
                            {crmApps.length < 3 && (
                                <button
                                    onClick={() => navigate(`/portal/${clientId}/create-crm`)}
                                    className="flex-shrink-0 p-4 rounded-lg border border-dashed hover:bg-muted/50 transition-colors text-center min-w-[180px] flex flex-col items-center justify-center gap-2"
                                >
                                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Create New CRM</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-6 bg-muted/30 rounded-lg">
                            <div className="text-center">
                                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <h4 className="font-medium mb-1">No CRMs yet</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Create your first CRM to manage your business
                                </p>
                                <Button asChild>
                                    <Link to={`/portal/${clientId}/create-crm`}>
                                        Create CRM
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legacy Project Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{overallProgress}%</p>}
                        <p className="text-xs text-muted-foreground">Overall completion</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Next Milestone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </>
                        ) : nextMilestone ? (
                            <>
                                <p className="text-2xl font-bold">{nextMilestone.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    Due {formatDistanceToNow(new Date(nextMilestone.dueDate!), { addSuffix: true })}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No upcoming milestones.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <>
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-32 mt-2" />
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-bold">PKR {pendingInvoiceTotal.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {pendingInvoiceTotal > 0 ? 'Total pending amount' : 'No pending invoices'}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Feed */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                    <CardDescription>Recent updates on your project.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : activity.length > 0 ? (
                        <div className="space-y-4">
                            {activity.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div>{activityIcons[item.type] || <Circle className="h-5 w-5 text-muted-foreground" />}</div>
                                    <div className="flex-1">
                                        <p className="text-sm">{item.text}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm text-center py-4">No recent activity.</p>
                    )}
                </CardContent>
            </Card>
        </ClientPortalLayout>
    );
}