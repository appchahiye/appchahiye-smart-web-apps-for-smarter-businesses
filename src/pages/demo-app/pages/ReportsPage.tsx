import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemoAppStore } from '@/stores/demoAppStore';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths } from 'date-fns';
export default function ReportsPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const data = useDemoAppStore(state => state.data);
  const chartData = useMemo(() => {
    if (!data) return { monthlyRevenue: [], newCustomers: [] };
    const sixMonthsAgo = subMonths(new Date(), 5);
    const monthlyData: { name: string; revenue: number; customers: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = format(d, 'MMM');
      monthlyData.push({ name: monthKey, revenue: 0, customers: 0 });
    }
    data.orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= sixMonthsAgo) {
        const monthKey = format(orderDate, 'MMM');
        const month = monthlyData.find(m => m.name === monthKey);
        if (month) {
          month.revenue += order.amount;
        }
      }
    });
    data.customers.forEach(customer => {
      const joinDate = new Date(customer.since);
      if (joinDate >= sixMonthsAgo) {
        const monthKey = format(joinDate, 'MMM');
        const month = monthlyData.find(m => m.name === monthKey);
        if (month) {
          month.customers += 1;
        }
      }
    });
    return { monthlyRevenue: monthlyData, newCustomers: monthlyData };
  }, [data]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      <p className="text-muted-foreground">
        Insights into your {businessType} business performance.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyRevenue}>
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
        <Card>
          <CardHeader>
            <CardTitle>New Customer Acquisition</CardTitle>
            <CardDescription>New customers over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.newCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}