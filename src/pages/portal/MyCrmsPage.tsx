import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { PlusCircle, ExternalLink, Settings, Trash2 } from 'lucide-react';
import type { CrmApp, Tenant } from '@shared/saas-types';

interface TenantWithApps {
    tenant: Tenant;
    apps: CrmApp[];
}

export default function MyCrmsPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const [data, setData] = useState<TenantWithApps | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clientId) {
            setIsLoading(true);
            // First get tenant
            api<{ tenant: Tenant }>(`/api/saas/my-tenant?userId=${clientId}`)
                .then(async (tenantData) => {
                    // Then get apps for tenant
                    const appsData = await api<{ apps: CrmApp[] }>(`/api/saas/tenants/${tenantData.tenant.id}/apps`);
                    setData({
                        tenant: tenantData.tenant,
                        apps: appsData.apps,
                    });
                })
                .catch(err => {
                    console.error("Failed to fetch CRMs:", err);
                    setError("Failed to load your CRMs");
                })
                .finally(() => setIsLoading(false));
        }
    }, [clientId]);

    const getBusinessTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            retail: 'Retail',
            services: 'Services',
            clinic: 'Healthcare',
            education: 'Education',
            realestate: 'Real Estate',
            hospitality: 'Hospitality',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    const getBusinessTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            retail: 'bg-orange-500/10 text-orange-500',
            services: 'bg-purple-500/10 text-purple-500',
            clinic: 'bg-red-500/10 text-red-500',
            education: 'bg-blue-500/10 text-blue-500',
            realestate: 'bg-green-500/10 text-green-500',
            hospitality: 'bg-amber-500/10 text-amber-500',
            custom: 'bg-gray-500/10 text-gray-500',
        };
        return colors[type] || 'bg-gray-500/10 text-gray-500';
    };

    return (
        <ClientPortalLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My CRMs</h1>
                        <p className="text-muted-foreground">
                            Manage your custom CRM applications
                        </p>
                    </div>
                    <Link to={`/portal/${clientId}/create-crm`}>
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Create New CRM
                        </Button>
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive text-center">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!isLoading && !error && data?.apps.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <PlusCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No CRMs yet</h3>
                            <p className="text-muted-foreground text-center mb-4 max-w-md">
                                Create your first custom CRM to manage your business.
                                Choose from templates like Retail, Services, Healthcare, and more.
                            </p>
                            <Link to={`/portal/${clientId}/create-crm`}>
                                <Button>Create Your First CRM</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* CRM Cards */}
                {!isLoading && !error && data && data.apps.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.apps.map(app => (
                            <Card key={app.id} className="group hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {app.name}
                                                {!app.isActive && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {app.description || 'No description'}
                                            </CardDescription>
                                        </div>
                                        <Badge className={getBusinessTypeColor(app.businessType)}>
                                            {getBusinessTypeLabel(app.businessType)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm text-muted-foreground">
                                        Created {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={() => window.open(`/app/${app.id}`, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Open CRM
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!isLoading && data && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{data.apps.length}</div>
                                    <div className="text-sm text-muted-foreground">Total CRMs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold capitalize">{data.tenant.plan}</div>
                                    <div className="text-sm text-muted-foreground">Current Plan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {data.apps.filter(a => a.isActive).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Active CRMs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {data.tenant.plan === 'free' ? '1' : '∞'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">CRM Limit</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ClientPortalLayout>
    );
}
