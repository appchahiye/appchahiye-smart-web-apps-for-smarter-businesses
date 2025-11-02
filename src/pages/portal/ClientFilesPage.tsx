import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalLayout } from '@/components/layout/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { ProjectWithMilestones } from '@shared/types';
import { Download, File as FileIcon } from 'lucide-react';
import { toast, Toaster } from '@/components/ui/sonner';
interface FileItem {
  name: string;
  url: string;
  milestone: string;
  project: string;
}
export default function ClientFilesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      api<ProjectWithMilestones[]>(`/api/portal/${clientId}/projects`)
        .then(projects => {
          const allFiles: FileItem[] = [];
          projects.forEach(project => {
            project.milestones.forEach(milestone => {
              milestone.files.forEach(fileUrl => {
                allFiles.push({
                  name: fileUrl.split('/').pop() || 'Untitled File',
                  url: fileUrl,
                  milestone: milestone.title,
                  project: project.title,
                });
              });
            });
          });
          setFiles(allFiles);
        })
        .catch(() => toast.error('Failed to load your files.'))
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);
  const handleDownload = (url: string) => {
    toast.info("This is a mock download. In a real app, this would download the file.");
    console.log("Downloading from:", url);
  };
  return (
    <ClientPortalLayout>
      <Toaster richColors />
      <Card>
        <CardHeader>
          <CardTitle>Files & Deliverables</CardTitle>
          <CardDescription>All your project files in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : files.length > 0 ? (
                files.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      {file.name}
                    </TableCell>
                    <TableCell>{file.milestone}</TableCell>
                    <TableCell>{file.project}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(file.url)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No files have been uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}