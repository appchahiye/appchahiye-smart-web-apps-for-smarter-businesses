import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { api } from '@/lib/api-client';
import type { FormSubmission } from '@shared/types';
import { format } from 'date-fns';
import { toast, Toaster } from '@/components/ui/sonner';
export default function FilledFormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    api<FormSubmission[]>('/api/admin/forms')
      .then(data => {
        setSubmissions(data);
      })
      .catch(() => {
        toast.error("Failed to load form submissions.");
      })
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <AdminLayout>
      <Toaster richColors />
      <Card>
        <CardHeader>
          <CardTitle>Project Requirements Forms</CardTitle>
          <CardDescription>Review all submitted project requirement forms from the website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Submitted At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : submissions.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {submissions.map(submission => (
                <AccordionItem value={submission.id} key={submission.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="grid grid-cols-5 items-center w-full text-sm text-left px-4 py-2">
                      <div className="col-span-1">{format(new Date(submission.submittedAt), 'PPP p')}</div>
                      <div className="col-span-1 font-medium">{submission.name}</div>
                      <div className="col-span-1">{submission.company}</div>
                      <div className="col-span-1 text-muted-foreground">{submission.email}</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 bg-muted/50 rounded-md m-2 space-y-4">
                      <div>
                        <h4 className="font-semibold">Project Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submission.projectDescription}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Desired Features</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submission.features}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No form submissions yet.
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}