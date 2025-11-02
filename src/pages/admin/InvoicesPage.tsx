import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api-client';
import type { InvoiceWithClientInfo, Client, User } from '@shared/types';
import { PlusCircle, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
type ClientWithUser = Client & { user?: User };
const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  amount: z.number().gt(0, { message: "Amount must be a positive number." }),
});
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClientInfo[]>([]);
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: '',
      amount: 0,
    },
  });
  const fetchInvoices = useCallback(() => {
    setIsLoading(true);
    api<InvoiceWithClientInfo[]>('/api/admin/invoices')
      .then(setInvoices)
      .catch(() => toast.error('Failed to load invoices.'))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    fetchInvoices();
    api<ClientWithUser[]>('/api/admin/clients')
      .then(setClients)
      .catch(() => toast.error('Failed to load clients.'));
  }, [fetchInvoices]);
  const handleStatusChange = async (invoiceId: string, status: 'paid' | 'pending') => {
    try {
      await api(`/api/admin/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast.success('Invoice status updated!');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await api(`/api/admin/invoices/${invoiceId}`, { method: 'DELETE' });
      toast.success('Invoice deleted successfully!');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice.');
    }
  };
  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      await api(`/api/admin/clients/${values.clientId}/invoices`, {
        method: 'POST',
        body: JSON.stringify({ amount: values.amount }),
      });
      toast.success('Invoice created successfully!');
      fetchInvoices();
      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create invoice.');
    }
  };
  return (
    <AdminLayout>
      <Toaster richColors />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> New Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.user?.name} ({client.company})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 999.99" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>All Invoices</CardTitle><CardDescription>Manage and track all client invoices.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : invoices.length > 0 ? (
                invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.clientCompany}</div>
                    </TableCell>
                    <TableCell>PKR {invoice.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
                    <TableCell>{format(new Date(invoice.issuedAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')} disabled={invoice.status === 'paid'}>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'pending')} disabled={invoice.status === 'pending'}>Mark as Pending</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the invoice.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No invoices found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}