import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Client, User } from '@shared/types';
import { format } from 'date-fns';
type ClientWithUser = Client & { user?: User };
export default function LeadsClientsPage() {
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    api<ClientWithUser[]>('/api/admin/clients')
      .then(data => {
        setClients(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch clients:", err);
        setIsLoading(false);
      });
  }, []);
  const handleManageProject = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/projects`);
  };
  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Leads & Clients</CardTitle>
          <CardDescription>View and manage all client accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : clients.length > 0 ? (
                clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.user?.name}</div>
                      <div className="text-sm text-muted-foreground">{client.user?.email}</div>
                    </TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>{client.projectType}</TableCell>
                    <TableCell><Badge variant={client.status === 'active' ? 'default' : 'secondary'}>{client.status}</Badge></TableCell>
                    <TableCell>{format(new Date(client.createdAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleManageProject(client.id)}>
                        Manage Projects
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No clients found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}