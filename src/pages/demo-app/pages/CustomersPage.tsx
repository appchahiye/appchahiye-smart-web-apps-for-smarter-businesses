import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useDemoAppStore } from '@/stores/demoAppStore';
export default function CustomersPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const customers = useDemoAppStore(state => state.data?.customers);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your {businessType === 'Clinic' ? 'patients' : 'customers'}.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            This section will allow you to view, add, and filter your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <ul className="space-y-2">
              {customers.map(customer => (
                <li key={customer.id} className="p-2 border rounded-md">
                  {customer.name} - {customer.email}
                </li>
              ))}
            </ul>
          ) : (
            <p>No customer data available for this business type.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            In the full application, you'll be able to click on a customer to see their full history, track interactions, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}