import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { UserPlus, Loader2, MoreHorizontal, Shield, Mail } from 'lucide-react';
import type { CrmApp, Module, CrmUser, CrmUserRole } from '@shared/saas-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_COLORS: Record<CrmUserRole, string> = {
    owner: 'bg-purple-500/10 text-purple-500 border-purple-500',
    admin: 'bg-blue-500/10 text-blue-500 border-blue-500',
    member: 'bg-green-500/10 text-green-500 border-green-500',
    viewer: 'bg-gray-500/10 text-gray-500 border-gray-500',
};

const ROLE_DESCRIPTIONS: Record<CrmUserRole, string> = {
    owner: 'Full access including deletion',
    admin: 'Can manage users and settings',
    member: 'Can create and edit records',
    viewer: 'Read-only access',
};

export default function CrmUsersPage() {
    const { appId } = useParams<{ appId: string }>();
    const context = useOutletContext<{ app?: CrmApp; modules?: Module[] }>();

    const [users, setUsers] = useState<CrmUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState<CrmUserRole>('member');

    const app = context?.app;
    const primaryColor = app?.branding?.primaryColor || '#6366f1';

    useEffect(() => {
        // Simulated - in real app would fetch from /api/saas/apps/:appId/users
        setIsLoading(false);
        setUsers([]);
    }, [appId]);

    const handleInvite = async () => {
        setIsInviting(true);
        // Simulated invite - would call API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInviteOpen(false);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('member');
        setIsInviting(false);
        alert('User invite feature coming soon!');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">
                        Manage who has access to this CRM
                    </p>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" style={{ backgroundColor: primaryColor }}>
                            <UserPlus className="h-4 w-4" />
                            Invite User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                            <DialogDescription>
                                Send an invitation to join this CRM
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={inviteName}
                                    onChange={e => setInviteName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as CrmUserRole)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {ROLE_DESCRIPTIONS[inviteRole]}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleInvite} disabled={isInviting || !inviteEmail || !inviteName}>
                                {isInviting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Invite
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Roles Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                {(['owner', 'admin', 'member', 'viewer'] as CrmUserRole[]).map(role => (
                    <Card key={role}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className={ROLE_COLORS[role]}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {ROLE_DESCRIPTIONS[role]}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        {users.length} team member{users.length !== 1 ? 's' : ''} with access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-14 w-full" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <UserPlus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                            <p className="text-muted-foreground text-center mb-4 max-w-md">
                                You're the only one here! Invite team members to collaborate on this CRM.
                            </p>
                            <Button onClick={() => setIsInviteOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Your First Team Member
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback>
                                                        {user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={ROLE_COLORS[user.role]}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                                                    <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        Remove
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
        </div>
    );
}
