import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import { useDemoAppStore } from '@/stores/demoAppStore';
import type { DemoOrder } from '@shared/types';
import { toast } from 'sonner';
const PAGE_SIZE = 5;
export default function OrdersPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const data = useDemoAppStore(state => state.data);
  const orderList = useDemoAppStore(state => state.data?.orders);
  const orders = useMemo(() => orderList || [], [orderList]);
  const customersById = useMemo(() => new Map(data?.customers.map(c => [c.id, c])), [data]);
  const customers = useMemo(() => data?.customers || [], [data]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DemoOrder; direction: 'asc' | 'desc' } | null>(null);
  const getTitle = () => {
    switch (businessType) {
      case 'Retail': return 'Orders';
      case 'Service': return 'Invoices';
      case 'Clinic': return 'Appointments';
      default: return 'Transactions';
    }
  };
  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = orders.filter(order =>
      statusFilter === 'All' || order.status === statusFilter
    );
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [orders, statusFilter, sortConfig]);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedAndFilteredOrders.slice(start, end);
  }, [sortedAndFilteredOrders, currentPage]);
  const totalPages = Math.ceil(sortedAndFilteredOrders.length / PAGE_SIZE);
  const requestSort = (key: keyof DemoOrder) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${getTitle()} created!`, { description: "In a real app, this would be saved." });
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground">
            Track all your {getTitle().toLowerCase()}.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New {getTitle()}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMockSubmit} className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="amount">Amount (PKR)</Label><Input id="amount" type="number" placeholder="199.99" /></div>
              <div>
                <Label>Status</Label>
                <Select defaultValue="Pending">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="submit">Create {getTitle()}</Button></DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent {getTitle()}</CardTitle>
          <CardDescription>
            A list of all {getTitle().toLowerCase()} in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('date')}>
                      Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('amount')}>
                      Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{customersById.get(order.customerId)?.name || 'Unknown'}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Pending' ? 'secondary' : 'destructive'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">PKR {order.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No {getTitle().toLowerCase()} found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}