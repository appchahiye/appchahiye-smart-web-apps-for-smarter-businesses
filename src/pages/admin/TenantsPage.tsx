import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Building2, PlusCircle, Search, Loader2, MoreHorizontal, ExternalLink, Database } from 'lucide-react';
import type { Tenant, TenantPlan, CrmApp } from '@shared/saas-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PLAN_COLORS: Record<TenantPlan, string> = {
    free: 'bg-gray-500/10 text-gray-500 border-gray-500',
    starter: 'bg-blue-500/10 text-blue-500 border-blue-500',
    pro: 'bg-purple-500/10 text-purple-500 border-purple-500',
    enterprise: 'bg-amber-500/10 text-amber-500 border-amber-500',
};

interface TenantWithStats extends Tenant {
    appCount?: number;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<TenantWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form fields
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newOwnerId, setNewOwnerId] = useState('');
    const [newPlan, setNewPlan] = useState<TenantPlan>('free');

    const fetchTenants = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api<{ tenants: Tenant[] }>('/api/saas/tenants');
            const tenantsWithStats = await Promise.all(
                data.tenants.map(async (tenant) => {
                    try {
                        const appsData = await api<{ apps: CrmApp[] }>(`/api/saas/tenants/${tenant.id}/apps`);
                        return { ...tenant, appCount: appsData.apps.length };
                    } catch {
                        return { ...tenant, appCount: 0 };
                    }
                })
            );
            setTenants(tenantsWithStats);
        } catch (err) {
            console.error("Failed to load workspaces:", err);
            toast.error("Failed to load workspaces");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const handleCreateTenant = async () => {
        if (!newName || !newSlug || !newOwnerId) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsCreating(true);
        try {
            await api('/api/saas/tenants', {
                method: 'POST',
                body: JSON.stringify({ name: newName, slug: newSlug, ownerId: newOwnerId, plan: newPlan }),
            });
            toast.success("Workspace created successfully");
            setIsCreateOpen(false);
            setNewName(''); setNewSlug(''); setNewOwnerId(''); setNewPlan('free');
            fetchTenants();
        } catch (err) {
            console.error("Failed to create workspace:", err);
            toast.error("Failed to create workspace");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteTenant = async (tenantId: string) => {
        if (!confirm('Are you sure? This will delete all associated CRMs and data.')) return;
        try {
            await api(`/api/saas/tenants/${tenantId}`, { method: 'DELETE' });
            toast.success("Workspace deleted");
            fetchTenants();
        } catch (err) {
            console.error("Failed to delete:", err);
            toast.error("Failed to delete workspace");
        }
    };

    const handleUpdatePlan = async (tenantId: string, plan: TenantPlan) => {
        try {
            await api(`/api/saas/tenants/${tenantId}`, { method: 'PUT', body: JSON.stringify({ plan }) });
            toast.success("Plan updated");
            fetchTenants();
        } catch (err) {
            console.error("Failed to update plan:", err);
            toast.error("Failed to update plan");
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Toaster richColors />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
                    <p className="text-muted-foreground">Manage client workspaces and their subscriptions</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><PlusCircle className="h-4 w-4" />New Workspace</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Workspace</DialogTitle>
                            <DialogDescription>Create a new workspace for a customer</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Workspace Name *</Label>
                                <Input placeholder="Acme Corp" value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug *</Label>
                                <Input placeholder="acme-corp" value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Owner ID *</Label>
                                <Input placeholder="client-uuid" value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Plan</Label>
                                <Select value={newPlan} onValueChange={v => setNewPlan(v as TenantPlan)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="starter">Starter</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTenant} disabled={isCreating}>
                                {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Workspace'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Workspaces</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{tenants.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Free Plan</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{tenants.filter(t => t.plan === 'free').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Paid Plans</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{tenants.filter(t => t.plan !== 'free').length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total CRMs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{tenants.reduce((sum, t) => sum + (t.appCount || 0), 0)}</div></CardContent></Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search workspaces..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                </CardContent>
            </Card>

            {/* Workspaces Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Workspaces</CardTitle>
                    <CardDescription>{filteredTenants.length} workspace{filteredTenants.length !== 1 ? 's' : ''} found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
                    ) : filteredTenants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
                            <p className="text-muted-foreground text-center mb-4">{searchTerm ? 'Try a different search term' : 'Workspaces are created automatically when clients sign up'}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>CRMs</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTenants.map(tenant => (
                                    <TableRow key={tenant.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium">{tenant.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{tenant.slug}</TableCell>
                                        <TableCell>
                                            <Select value={tenant.plan} onValueChange={v => handleUpdatePlan(tenant.id, v as TenantPlan)}>
                                                <SelectTrigger className="w-28">
                                                    <Badge variant="outline" className={PLAN_COLORS[tenant.plan]}>{tenant.plan}</Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="starter">Starter</SelectItem>
                                                    <SelectItem value="pro">Pro</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1"><Database className="h-3 w-3 text-muted-foreground" />{tenant.appCount || 0}</div>
                                        </TableCell>
                                        <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(`/portal/${tenant.ownerId}/my-crms`, '_blank')}>
                                                        <ExternalLink className="h-4 w-4 mr-2" />View Portal
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTenant(tenant.id)}>
                                                        Delete Workspace
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
