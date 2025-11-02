import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api-client';
import type { InvoiceWithClientInfo, Client, User, Service } from '@shared/types';
import { PlusCircle, MoreHorizontal, Loader2, Trash2, Check, ChevronsUpDown, X } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
type ClientWithUser = Client & { user?: User };
const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  serviceIds: z.array(z.string()).min(1, 'At least one service must be selected'),
});
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClientInfo[]>([]);
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: '',
      serviceIds: [],
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
    api<ClientWithUser[]>('/api/admin/clients').then(setClients).catch(() => toast.error('Failed to load clients.'));
    api<Service[]>('/api/admin/services').then(setServices).catch(() => toast.error('Failed to load services.'));
  }, [fetchInvoices]);
  const handleStatusChange = async (invoiceId: string, status: 'paid' | 'pending') => {
    try {
      await api(`/api/admin/invoices/${invoiceId}`, { method: 'PUT', body: JSON.stringify({ status }) });
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
        body: JSON.stringify({ serviceIds: values.serviceIds }),
      });
      toast.success('Invoice created successfully!');
      fetchInvoices();
      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create invoice.');
    }
  };
  const selectedServiceIds = form.watch('serviceIds');
  const totalAmount = selectedServiceIds.reduce((acc, id) => {
    const service = services.find(s => s.id === id);
    return acc + (service?.price || 0);
  }, 0);
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
                <FormField control={form.control} name="serviceIds" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Services</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                            {field.value?.length > 0 ? `${field.value.length} selected` : "Select services"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search services..." />
                          <CommandList>
                            <CommandEmpty>No services found.</CommandEmpty>
                            <CommandGroup>
                              {services.map((service) => (
                                <CommandItem
                                  value={service.name}
                                  key={service.id}
                                  onSelect={() => {
                                    const currentIds = field.value || [];
                                    const newIds = currentIds.includes(service.id)
                                      ? currentIds.filter(id => id !== service.id)
                                      : [...currentIds, service.id];
                                    field.onChange(newIds);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", field.value?.includes(service.id) ? "opacity-100" : "opacity-0")} />
                                  <div className="flex justify-between w-full">
                                    <span>{service.name}</span>
                                    <span className="text-muted-foreground">PKR {service.price.toFixed(2)}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="pt-2">
                  <h3 className="text-lg font-semibold">Total: PKR {totalAmount.toFixed(2)}</h3>
                </div>
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
                <TableHead>Services</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {invoice.services?.map(s => s.name).join(', ') || 'N/A'}
                      </div>
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
                <TableRow><TableCell colSpan={6} className="text-center">No invoices found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}