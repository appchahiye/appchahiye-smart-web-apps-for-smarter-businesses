import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Project, Milestone } from '@shared/types';
import { PlusCircle } from 'lucide-react';
// This would be a more complex component in a real app
const ProjectCard = ({ project }: { project: Project }) => (
  <Card>
    <CardHeader>
      <CardTitle>{project.title}</CardTitle>
      <CardDescription>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Label>Progress</Label>
          <Progress value={project.progress} className="w-full" />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Milestones</h4>
          {/* Milestone management UI would go here */}
          <p className="text-sm text-muted-foreground">Milestone management coming soon.</p>
        </div>
        <Button size="sm" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Milestone
        </Button>
      </div>
    </CardContent>
  </Card>
);
export default function ClientProjectsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      api<Project[]>(`/api/admin/clients/${clientId}/projects`)
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
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Projects for Client</h1>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> New Project</Button>
      </div>
      <div className="grid gap-6">
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
          projects.map(project => <ProjectCard key={project.id} project={project} />)
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No projects found for this client.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}