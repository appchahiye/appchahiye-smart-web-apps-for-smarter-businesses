import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { AdminDashboardStats } from "@shared/types";
import { toast, Toaster } from "@/components/ui/sonner";
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    api<AdminDashboardStats>('/api/admin/dashboard-stats')
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard statistics."))
      .finally(() => setIsLoading(false));
  }, []);
  const StatCard = ({ title, value, description, isLoading }: { title: string; value: string | number; description?: string; isLoading: boolean; }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16" />
            {description && <Skeleton className="h-4 w-24 mt-1" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
  return (
    <AdminLayout>
      <Toaster richColors />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={stats?.totalLeads ?? 0} isLoading={isLoading} />
        <StatCard title="Active Clients" value={stats?.activeClients ?? 0} isLoading={isLoading} />
        <StatCard title="Projects in Progress" value={stats?.projectsInProgress ?? 0} isLoading={isLoading} />
        <StatCard title="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} isLoading={isLoading} />
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
                <CardDescription>This is your dashboard. More features are coming soon.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>From here, you will be able to manage website content, client leads, projects, and more.</p>
            </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}