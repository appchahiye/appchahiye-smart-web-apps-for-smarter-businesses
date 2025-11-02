import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/DatePicker';
import { api } from '@/lib/api-client';
import type { Project, Milestone, ProjectWithMilestones } from '@shared/types';
import { PlusCircle, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
// Schemas for form validation
const projectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters long'),
});
const milestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  dueDate: z.date().optional().nullable(),
});
type ProjectFormValues = z.infer<typeof projectSchema>;
type MilestoneFormValues = z.infer<typeof milestoneSchema>;
// Milestone Modal Component
const MilestoneModal = ({
  projectId,
  milestone,
  onSuccess,
  children,
}: {
  projectId: string;
  milestone?: Milestone;
  onSuccess: () => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: milestone?.title || '',
      description: milestone?.description || '',
      status: milestone?.status || 'todo',
      dueDate: milestone?.dueDate ? new Date(milestone.dueDate) : undefined,
    },
  });
  const onSubmit = async (values: MilestoneFormValues) => {
    const payload = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.getTime() : null,
    };
    try {
      if (milestone) {
        await api(`/api/admin/milestones/${milestone.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Milestone updated successfully!');
      } else {
        await api(`/api/admin/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Milestone added successfully!');
      }
      onSuccess();
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to save milestone.');
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{milestone ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Milestone
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
// Project Card Component
const ProjectCard = ({ project, onUpdate }: { project: ProjectWithMilestones; onUpdate: () => void }) => {
  const calculateProgress = () => {
    if (project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / project.milestones.length) * 100);
  };
  const progress = calculateProgress();
  useEffect(() => {
    // If calculated progress differs from stored progress, update it.
    if (progress !== project.progress) {
      api(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ progress }),
      }).catch(err => console.error("Failed to auto-update progress", err));
    }
  }, [progress, project.progress, project.id]);
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{project.title}</CardTitle>
          <MilestoneModal projectId={project.id} onSuccess={onUpdate}>
            <Button size="sm" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Milestone
            </Button>
          </MilestoneModal>
        </div>
        <CardDescription>Last updated: {format(new Date(project.updatedAt), 'PPP')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Progress</Label>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-full" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Milestones</h4>
            <div className="space-y-2">
              {project.milestones.length > 0 ? (
                project.milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between p-2 rounded-md border">
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.status.replace('_', ' ')}</p>
                    </div>
                    <MilestoneModal projectId={project.id} milestone={milestone} onSuccess={onUpdate}>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </MilestoneModal>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No milestones yet.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
// Main Page Component
export default function ClientProjectsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });
  const fetchProjects = useCallback(() => {
    if (clientId) {
      setIsLoading(true);
      api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`)
        .then(data => {
          setProjects(data);
        })
        .catch(err => {
          console.error("Failed to fetch projects:", err);
          toast.error("Failed to load projects.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  const onNewProjectSubmit = async (values: ProjectFormValues) => {
    if (!clientId) return;
    try {
      await api(`/api/admin/clients/${clientId}/projects`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Project created successfully!');
      fetchProjects();
      setIsProjectModalOpen(false);
      projectForm.reset();
    } catch (error) {
      toast.error('Failed to create project.');
    }
  };
  return (
    <AdminLayout>
      <Toaster richColors />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Projects for Client</h1>
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onNewProjectSubmit)} className="space-y-4">
                <FormField control={projectForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl><Input placeholder="e.g., New CRM Development" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={projectForm.formState.isSubmitting}>
                    {projectForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : projects.length > 0 ? (
          projects.map(project => <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />)
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No projects found for this client.</p>
              <p>Click "New Project" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}