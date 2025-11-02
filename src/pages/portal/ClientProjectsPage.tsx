import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalLayout } from '@/components/layout/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { ProjectWithMilestones, Milestone } from '@shared/types';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  todo: <Circle className="h-5 w-5 text-muted-foreground" />,
};
const MilestoneItem = ({ milestone }: { milestone: Milestone }) => (
  <div className="flex items-start gap-4 py-4">
    <div>{statusIcons[milestone.status]}</div>
    <div className="flex-1">
      <p className="font-semibold">{milestone.title}</p>
      <p className="text-sm text-muted-foreground">{milestone.description}</p>
    </div>
    {milestone.dueDate && (
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        Due {format(new Date(milestone.dueDate), 'MMM d')}
      </div>
    )}
  </div>
);
export default function ClientProjectsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`)
        .then(data => {
          setProjects(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch projects:", err);
          setIsLoading(false);
        });
    }
  }, [clientId]);
  return (
    <ClientPortalLayout>
      <div className="space-y-8">
        {isLoading ? (
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : projects.length > 0 ? (
          projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>
                      {project.deadline ? `Deadline: ${format(new Date(project.deadline), 'PPP')}` : 'No deadline set'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{project.progress}% Complete</Badge>
                </div>
                <Progress value={project.progress} className="mt-4" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Milestones</h3>
                <div className="divide-y">
                  {project.milestones.length > 0 ? (
                    project.milestones.map(m => <MilestoneItem key={m.id} milestone={m} />)
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No milestones for this project yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Your projects will appear here once they are added by our team.
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  );
}