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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/DatePicker';
import { api } from '@/lib/api-client';
import type { Project, Milestone, ProjectWithMilestones } from '@shared/types';
import { PlusCircle, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
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
const MilestoneModal = ({
  projectId,
  milestone,
  onDataChange,
  children,
}: {
  projectId: string;
  milestone?: Milestone;
  onDataChange: () => void;
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
      onDataChange();
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
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
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
              <FormItem><FormLabel>Due Date</FormLabel><FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
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
const ProjectCard = ({ project, onDataChange }: { project: ProjectWithMilestones; onDataChange: () => void }) => {
  const progress = project.milestones.length > 0 ? Math.round(project.milestones.filter(m => m.status === 'completed').length / project.milestones.length * 100) : 0;
  useEffect(() => {
    if (progress !== project.progress) {
      api(`/api/admin/projects/${project.id}`, { method: 'PUT', body: JSON.stringify({ progress }) })
        .catch(err => console.error("Failed to auto-update progress", err));
    }
  }, [progress, project.progress, project.id]);
  const handleDeleteProject = async () => {
    try {
      await api(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      toast.success('Project deleted successfully!');
      onDataChange();
    } catch (error) {
      toast.error('Failed to delete project.');
    }
  };
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await api(`/api/admin/milestones/${milestoneId}`, { method: 'DELETE' });
      toast.success('Milestone deleted successfully!');
      onDataChange();
    } catch (error) {
      toast.error('Failed to delete milestone.');
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{project.title}</CardTitle>
          <div className="flex items-center gap-2">
            <MilestoneModal projectId={project.id} onDataChange={onDataChange}>
              <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Milestone</Button>
            </MilestoneModal>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete Project</DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Project?</AlertDialogTitle><AlertDialogDescription>This will delete the project and all its milestones. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription>Last updated: {format(new Date(project.updatedAt), 'PPP')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Progress</Label>
            <div className="flex items-center gap-2"><Progress value={progress} className="w-full" /><span className="text-sm font-medium">{progress}%</span></div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Milestones</h4>
            <div className="space-y-2">
              {project.milestones.length > 0 ? (
                project.milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between p-2 rounded-md border group">
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.status.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MilestoneModal projectId={project.id} milestone={milestone} onDataChange={onDataChange}>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </MilestoneModal>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete Milestone?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteMilestone(milestone.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
export default function ClientProjectsPageAdmin() {
  const { clientId } = useParams<{ clientId: string }>();
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const projectForm = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema) });
  const fetchProjects = useCallback(() => {
    if (clientId) {
      setIsLoading(true);
      api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`)
        .then(data => setProjects(data))
        .catch(err => { console.error("Failed to fetch projects:", err); toast.error("Failed to load projects."); })
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  const onNewProjectSubmit = async (values: ProjectFormValues) => {
    if (!clientId) return;
    try {
      await api(`/api/admin/clients/${clientId}/projects`, { method: 'POST', body: JSON.stringify(values) });
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
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> New Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onNewProjectSubmit)} className="space-y-4">
                <FormField control={projectForm.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="e.g., New CRM Development" {...field} /></FormControl><FormMessage /></FormItem>
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
              <CardContent className="space-y-4"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-8 w-full" /><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : projects.length > 0 ? (
          projects.map(project => <ProjectCard key={project.id} project={project} onDataChange={fetchProjects} />)
        ) : (
          <Card><CardContent className="pt-6 text-center text-muted-foreground"><p>No projects found for this client.</p><p>Click "New Project" to get started.</p></CardContent></Card>
        )}
      </div>
    </AdminLayout>
  );
}