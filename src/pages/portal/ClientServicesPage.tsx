import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalLayout } from '@/components/layout/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Service } from '@shared/types';
import { Toaster, toast } from '@/components/ui/sonner';
export default function ClientServicesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      api<Service[]>(`/api/portal/${clientId}/services`)
        .then(setServices)
        .catch(() => toast.error('Failed to load available services.'))
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);
  return (
    <ClientPortalLayout>
      <Toaster richColors />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Our Services</h1>
        <p className="text-muted-foreground">
          Browse the services we offer to help streamline and grow your business.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))
            : services.length > 0
            ? services.map(service => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{service.name}</CardTitle>
                      <Badge variant="outline">{service.type}</Badge>
                    </div>
                    <CardDescription className="font-semibold text-lg text-primary">
                      PKR {service.price.toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))
            : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-muted-foreground">No services are available at the moment.</p>
              </div>
            )}
        </div>
      </div>
    </ClientPortalLayout>
  );
}