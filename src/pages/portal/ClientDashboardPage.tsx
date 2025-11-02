import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { ProjectWithMilestones, Invoice, ActivityItem } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Circle, Clock } from 'lucide-react';
export default function ClientDashboardPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      Promise.all([
        api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`),
        api<Invoice[]>(`/api/portal/${clientId}/invoices`),
        api<ActivityItem[]>(`/api/portal/${clientId}/activity`),
      ]).then(([projectData, invoiceData, activityData]) => {
        setProjects(projectData);
        setInvoices(invoiceData);
        setActivity(activityData);
      }).catch(err => {
        console.error("Failed to fetch dashboard data:", err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [clientId]);
  const overallProgress = useMemo(() => {
    if (!projects || projects.length === 0) return 0;
    const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(totalProgress / projects.length);
  }, [projects]);
  const nextMilestone = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    const allMilestones = projects.flatMap(p => p.milestones);
    const upcoming = allMilestones
      .filter(m => m.status !== 'completed' && m.dueDate)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
    return upcoming[0] || null;
  }, [projects]);
  const pendingInvoiceTotal = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);
  const activityIcons = {
    project_created: <CheckCircle className="h-5 w-5 text-primary" />,
    milestone_updated: <Clock className="h-5 w-5 text-blue-500" />,
    milestone_created: <Circle className="h-5 w-5 text-muted-foreground" />,
  };
  return (
    <ClientPortalLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{overallProgress}%</p>}
                    <p className="text-xs text-muted-foreground">Overall completion</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Next Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </>
                    ) : nextMilestone ? (
                        <>
                            <p className="text-2xl font-bold">{nextMilestone.title}</p>
                            <p className="text-xs text-muted-foreground">
                                Due {formatDistanceToNow(new Date(nextMilestone.dueDate!), { addSuffix: true })}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No upcoming milestones.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-32 mt-2" />
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold">PKR {pendingInvoiceTotal.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                                {pendingInvoiceTotal > 0 ? 'Total pending amount' : 'No pending invoices'}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent updates on your project.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : activity.length > 0 ? (
                    <div className="space-y-4">
                        {activity.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div>{activityIcons[item.type] || <Circle className="h-5 w-5 text-muted-foreground" />}</div>
                                <div className="flex-1">
                                    <p className="text-sm">{item.text}</p>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No recent activity.</p>
                )}
            </CardContent>
        </Card>
    </ClientPortalLayout>
  );
}