import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useDemoAppStore } from '@/stores/demoAppStore';
export default function OrdersPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const orders = useDemoAppStore(state => state.data?.orders);
  const getTitle = () => {
    switch (businessType) {
      case 'Retail': return 'Orders';
      case 'Service': return 'Invoices';
      case 'Clinic': return 'Appointments';
      default: return 'Transactions';
    }
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent {getTitle()}</CardTitle>
          <CardDescription>
            This section will allow you to track statuses and generate receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <ul className="space-y-2">
              {orders.map(order => (
                <li key={order.id} className="p-2 border rounded-md">
                  Order #{order.id.slice(0, 6)} - {order.status} - PKR {order.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No order data available for this business type.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            In the full application, you'll be able to create new orders, update their status, and generate mock invoices or receipts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}