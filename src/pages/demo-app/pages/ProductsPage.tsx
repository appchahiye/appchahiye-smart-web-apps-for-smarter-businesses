import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import { useDemoAppStore } from '@/stores/demoAppStore';
import type { DemoProduct } from '@shared/types';
import { toast } from 'sonner';
const PAGE_SIZE = 5;
export default function ProductsPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const productList = useDemoAppStore(state => state.data?.products);
  const products = useMemo(() => productList || [], [productList]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DemoProduct; direction: 'asc' | 'desc' } | null>(null);
  const getTitle = () => {
    switch (businessType) {
      case 'Retail': return 'Products';
      case 'Service': return 'Services';
      case 'Clinic': return 'Treatments';
      default: return 'Items';
    }
  };
  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(filter.toLowerCase())
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
  }, [products, filter, sortConfig]);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedAndFilteredProducts.slice(start, end);
  }, [sortedAndFilteredProducts, currentPage]);
  const totalPages = Math.ceil(sortedAndFilteredProducts.length / PAGE_SIZE);
  const requestSort = (key: keyof DemoProduct) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${getTitle()} added!`, { description: "In a real app, this would be saved." });
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground">
            Manage your {getTitle().toLowerCase()}.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {getTitle()}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMockSubmit} className="space-y-4">
              <div><Label htmlFor="name">Name</Label><Input id="name" placeholder="Item Name" /></div>
              <div><Label htmlFor="price">Price (PKR)</Label><Input id="price" type="number" placeholder="99.99" /></div>
              <div><Label htmlFor="stock">Stock / Availability</Label><Input id="stock" type="number" placeholder="100" /></div>
              <DialogFooter>
                <DialogClose asChild><Button type="submit">Add {getTitle()}</Button></DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()} List</CardTitle>
          <CardDescription>
            A list of all {getTitle().toLowerCase()} in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder={`Filter by ${getTitle().toLowerCase()} name...`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')}>
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('price')}>
                      Price <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Stock / Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>PKR {product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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