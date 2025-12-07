/**
 * SaaS Dashboard Page
 * 
 * Main dashboard showing user's CRMs and quick actions.
 * Replaces the old ClientDashboardPage for SaaS users.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase, Settings, ArrowRight, LayoutDashboard } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { CrmApp, Tenant } from '@shared/saas-types';

interface DashboardData {
    tenant: Tenant | null;
    apps: CrmApp[];
}

export default function SaasDashboardPage() {
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({ tenant: null, apps: [] });

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch tenant info
                const tenantRes = await api<Tenant>(`/api/saas/tenants/${tenantId}`);

                // Fetch apps
                const appsRes = await api<{ apps: CrmApp[] }>(`/api/saas/tenants/${tenantId}/apps`);

                setData({
                    tenant: tenantRes,
                    apps: appsRes.apps || [],
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (tenantId) {
            fetchData();
        }
    }, [tenantId]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back{data.tenant?.name ? `, ${data.tenant.name}` : ''}!
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your CRM applications and data
                    </p>
                </div>
                <Button onClick={() => navigate(`/saas/${tenantId}/create`)} className="bg-gradient-brand text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New CRM
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total CRMs</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.apps.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.tenant?.plan === 'free' ? 'Free plan: 1 CRM limit' : 'Unlimited CRMs'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{data.tenant?.plan || 'Free'}</div>
                        <p className="text-xs text-muted-foreground">
                            <button className="text-primary hover:underline" onClick={() => navigate(`/saas/${tenantId}/billing`)}>
                                Upgrade plan
                            </button>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active CRMs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.apps.filter(a => a.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.apps.filter(a => !a.isActive).length} inactive
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CRM List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your CRMs</h2>

                {data.apps.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No CRMs yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Create your first CRM to start managing your business data
                            </p>
                            <Button onClick={() => navigate(`/saas/${tenantId}/create`)} className="bg-gradient-brand text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First CRM
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {data.apps.map((app) => (
                            <Card
                                key={app.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => navigate(`/app/${app.id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                                            style={{ backgroundColor: app.branding.primaryColor || '#6366f1' }}
                                        >
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{app.name}</CardTitle>
                                            <CardDescription>{app.description || 'No description'}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {app.enabledPillars.slice(0, 3).map((pillar) => (
                                                <span
                                                    key={pillar}
                                                    className="text-xs bg-muted px-2 py-1 rounded capitalize"
                                                >
                                                    {pillar}
                                                </span>
                                            ))}
                                            {app.enabledPillars.length > 3 && (
                                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                                    +{app.enabledPillars.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Add New Card */}
                        <Card
                            className="border-dashed cursor-pointer hover:border-primary transition-colors"
                            onClick={() => navigate(`/saas/${tenantId}/create`)}
                        >
                            <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px]">
                                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-muted-foreground">Add New CRM</span>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
