import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemoAppStore } from '@/stores/demoAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
export default function DashboardPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const data = useDemoAppStore(state => state.data);
  const stats = useMemo(() => {
    if (!data) return { totalRevenue: 0, newCustomers: 0, totalOrders: 0, monthlyRevenue: [] };
    const totalRevenue = data.orders.reduce((sum, order) => sum + order.amount, 0);
    const newCustomers = data.customers.length;
    const totalOrders = data.orders.length;
    const monthlyRevenue: { name: string; revenue: number }[] = [];
    const sixMonthsAgo = subMonths(new Date(), 5);
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = format(d, 'MMM');
      monthlyRevenue.push({ name: monthKey, revenue: 0 });
    }
    data.orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= sixMonthsAgo) {
        const monthKey = format(orderDate, 'MMM');
        const monthData = monthlyRevenue.find(m => m.name === monthKey);
        if (monthData) {
          monthData.revenue += order.amount;
        }
      }
    });
    return { totalRevenue, newCustomers, totalOrders, monthlyRevenue };
  }, [data]);
  const recentActivity = useMemo(() => {
    if (!data) return [];
    const customersById = new Map(data.customers.map(c => [c.id, c]));
    return data.orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(order => ({
        ...order,
        customer: customersById.get(order.customerId),
      }));
  }, [data]);
  const getOrderTitle = () => {
    switch (businessType) {
      case 'Retail': return 'Orders';
      case 'Service': return 'Invoices';
      case 'Clinic': return 'Appointments';
      default: return 'Transactions';
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        An overview of your {businessType} business.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>New Customers</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+{stats.newCustomers}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{getOrderTitle()}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `PKR ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest {getOrderTitle().toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={activity.customer?.avatarUrl} />
                      <AvatarFallback>{activity.customer?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activity.customer?.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.status}</p>
                    </div>
                  </div>
                  <p className="font-medium">PKR {activity.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}