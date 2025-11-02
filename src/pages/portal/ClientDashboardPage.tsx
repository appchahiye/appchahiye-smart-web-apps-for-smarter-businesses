import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function ClientDashboardPage() {
  return (
    <ClientPortalLayout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">75%</p>
                    <p className="text-xs text-muted-foreground">Next milestone: UI Polish</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Next Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">UI Polish</p>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">$2,500</p>
                    <p className="text-xs text-muted-foreground">1 invoice pending</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent updates on your project.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Placeholder for activity feed.</p>
            </CardContent>
        </Card>
    </ClientPortalLayout>
  );
}