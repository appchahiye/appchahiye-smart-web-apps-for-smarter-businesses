import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemoAppStore } from '@/stores/demoAppStore';
export default function DashboardPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        An overview of your {businessType} business.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">PKR 12,345</p>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+23</p>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders / Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">57</p>
            <p className="text-xs text-muted-foreground">+15 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">1 overdue</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This dashboard will be filled with dynamic charts, KPIs, and widgets tailored to your business type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Imagine interactive graphs showing your sales trends, a list of recent orders, and quick actions to manage your daily tasks.</p>
        </CardContent>
      </Card>
    </div>
  );
}