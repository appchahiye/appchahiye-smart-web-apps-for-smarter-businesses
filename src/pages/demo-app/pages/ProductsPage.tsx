import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useDemoAppStore } from '@/stores/demoAppStore';
export default function ProductsPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const products = useDemoAppStore(state => state.data?.products);
  const getTitle = () => {
    switch (businessType) {
      case 'Retail': return 'Products';
      case 'Service': return 'Services';
      case 'Clinic': return 'Treatments';
      default: return 'Items';
    }
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()} List</CardTitle>
          <CardDescription>
            This section will allow you to manage inventory, pricing, and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <ul className="space-y-2">
              {products.map(product => (
                <li key={product.id} className="p-2 border rounded-md">
                  {product.name} - PKR {product.price.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No product/service data available for this business type.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            The full application will feature robust inventory tracking, service availability management, and detailed product pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}