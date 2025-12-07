/**
 * Portal to SaaS Redirect
 * 
 * Redirects old portal users to the new SaaS dashboard.
 * Creates a tenant for them if they don't have one.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import type { Tenant } from '@shared/saas-types';

export default function PortalRedirect() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAndRedirect() {
            try {
                // Try to find existing tenant for this user
                const response = await api<{ tenants: Tenant[] }>(`/api/saas/tenants?userId=${clientId}`);

                if (response.tenants && response.tenants.length > 0) {
                    // Has tenant - redirect to SaaS dashboard
                    navigate(`/saas/${response.tenants[0].id}`, { replace: true });
                } else {
                    // No tenant - create one
                    const newTenant = await api<Tenant>('/api/saas/tenants', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: 'My Workspace',
                            ownerId: clientId,
                        }),
                    });
                    navigate(`/saas/${newTenant.id}`, { replace: true });
                }
            } catch (error) {
                console.error('Failed to redirect to SaaS:', error);
                // If API fails, show a message to sign in again
                setChecking(false);
            }
        }

        if (clientId) {
            checkAndRedirect();
        }
    }, [clientId, navigate]);

    if (!checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Welcome to AppChahiye SaaS!</h1>
                    <p className="text-muted-foreground mb-6">
                        We've upgraded to a new CRM platform. Please sign in again to access your dashboard.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Redirecting to your new dashboard...</p>
            </div>
        </div>
    );
}
