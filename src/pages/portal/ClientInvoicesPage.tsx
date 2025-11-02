import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalLayout } from '@/components/layout/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Invoice } from '@shared/types';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { toast, Toaster } from '@/components/ui/sonner';
export default function ClientInvoicesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      api<Invoice[]>(`/api/portal/${clientId}/invoices`)
        .then(setInvoices)
        .catch(() => toast.error('Failed to load your invoices.'))
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);
  const handleDownload = (url: string) => {
    toast.info("This is a mock download. In a real app, this would download the PDF.");
    console.log("Downloading from:", url);
  };
  return (
    <ClientPortalLayout>
      <Toaster richColors />
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
          <CardDescription>Here is a list of all your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : invoices.length > 0 ? (
                invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.id.substring(0, 8)}</TableCell>
                    <TableCell>PKR {invoice.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
                    <TableCell>{format(new Date(invoice.issuedAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(invoice.pdf_url)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">You have no invoices yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}