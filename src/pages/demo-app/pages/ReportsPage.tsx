import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemoAppStore } from '@/stores/demoAppStore';
export default function ReportsPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      <p className="text-muted-foreground">
        Insights into your {businessType} business performance.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will feature interactive charts and data visualizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Imagine seeing your sales trends over time, identifying your top-selling products or most valuable customers, and gaining actionable insights to grow your business.
          </p>
          <div className="mt-4 p-8 border-dashed border-2 rounded-lg flex items-center justify-center text-muted-foreground">
            Chart Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}