import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from '@/lib/api-client';
import { toast, Toaster } from '@/components/ui/sonner';
import { LayoutGrid, Search, MoreHorizontal, ExternalLink, Users, Layers, Trash2 } from 'lucide-react';
import type { CrmApp, Tenant, BusinessType } from '@shared/saas-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
    retail: 'Retail',
    services: 'Services',
    healthcare: 'Healthcare',
    realestate: 'Real Estate',
    education: 'Education',
    hospitality: 'Hospitality',
    manufacturing: 'Manufacturing',
    nonprofit: 'Non-Profit',
    custom: 'Custom',
};

interface CrmAppWithTenant extends CrmApp {
    tenantName?: string;
    moduleCount?: number;
    userCount?: number;
}

export default function CrmAppsPage() {
    const [apps, setApps] = useState<CrmAppWithTenant[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all tenants first
            const tenantsData = await api<{ tenants: Tenant[] }>('/api/saas/tenants');
            setTenants(tenantsData.tenants);

            // Fetch apps for each tenant
            const allApps: CrmAppWithTenant[] = [];
            for (const tenant of tenantsData.tenants) {
                try {
                    const appsData = await api<{ apps: CrmApp[] }>(`/api/saas/tenants/${tenant.id}/apps`);
                    for (const app of appsData.apps) {
                        // Get module count
                        try {
                            const appDetails = await api<{ app: CrmApp; modules: unknown[] }>(`/api/saas/apps/${app.id}`);
                            allApps.push({
                                ...app,
                                tenantName: tenant.name,
                                moduleCount: appDetails.modules.length,
                            });
                        } catch {
                            allApps.push({ ...app, tenantName: tenant.name, moduleCount: 0 });
                        }
                    }
                } catch (err) {
                    console.error(`Failed to load apps for tenant ${tenant.id}:`, err);
                }
            }
            setApps(allApps);
        } catch (err) {
            console.error("Failed to load data:", err);
            toast.error("Failed to load CRM apps");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteApp = async (appId: string) => {
        if (!confirm('Are you sure you want to delete this CRM? All data will be lost.')) return;

        try {
            await api(`/api/saas/apps/${appId}`, { method: 'DELETE' });
            toast.success("CRM deleted");
            fetchData();
        } catch (err) {
            console.error("Failed to delete app:", err);
            toast.error("Failed to delete CRM");
        }
    };

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by business type for stats
    const businessTypeStats = apps.reduce((acc, app) => {
        acc[app.businessType] = (acc[app.businessType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <AdminLayout>
            <Toaster richColors />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">CRM Applications</h1>
                <p className="text-muted-foreground">
                    View and manage all CRM instances across tenants
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total CRMs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{apps.length}</div>
                        <p className="text-xs text-muted-foreground">
                            across {tenants.length} tenants
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active CRMs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {apps.filter(a => a.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {apps.reduce((sum, a) => sum + (a.moduleCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Top Business Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.entries(businessTypeStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search CRMs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* CRM Apps Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All CRM Applications</CardTitle>
                    <CardDescription>
                        {filteredApps.length} CRM{filteredApps.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No CRMs found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {searchTerm ? 'Try a different search term' : 'No CRM applications have been created yet'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CRM Name</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Business Type</TableHead>
                                    <TableHead>Modules</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApps.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                                                    style={{ backgroundColor: app.branding?.primaryColor || '#6366f1' }}
                                                >
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">{app.name}</span>
                                                    {app.description && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {app.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.tenantName || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {BUSINESS_TYPE_LABELS[app.businessType] || app.businessType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Layers className="h-3 w-3 text-muted-foreground" />
                                                {app.moduleCount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={app.isActive ? 'default' : 'secondary'}>
                                                {app.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(`/app/${app.id}`, '_blank')}>
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Open CRM
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`/app/${app.id}/users`, '_blank')}>
                                                        <Users className="h-4 w-4 mr-2" />
                                                        View Users
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteApp(app.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete CRM
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
