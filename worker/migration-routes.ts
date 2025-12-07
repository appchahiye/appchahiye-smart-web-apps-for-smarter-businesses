/**
 * Migration Routes
 * 
 * Endpoints for migrating existing clients to the new SaaS tenant system
 */

import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad } from './core-utils';
import { ClientEntity } from './entities';
import { TenantEntity } from './saas-entities';
import { createCrmFromWizard } from './crm/generator';
import type { TenantPlan, BusinessType, Tenant } from '@shared/saas-types';

interface MigrationResult {
    clientId: string;
    clientCompany: string;
    tenantId: string;
    success: boolean;
    error?: string;
}

/**
 * Register migration routes
 */
export function registerMigrationRoutes(app: Hono<{ Bindings: Env }>) {

    // ===========================================
    // Migrate All Clients to Tenants
    // ===========================================

    app.post('/api/admin/migrate-clients', async (c) => {
        let dryRun = false;
        let businessType: BusinessType = 'services';

        try {
            const body = await c.req.json<{ dryRun?: boolean; businessType?: BusinessType }>();
            dryRun = body.dryRun ?? false;
            businessType = body.businessType ?? 'services';
        } catch {
            // Use defaults
        }

        const results: MigrationResult[] = [];

        try {
            // Get all existing clients
            const { items: clients } = await ClientEntity.list(c.env);

            for (const client of clients) {
                try {
                    // Check if tenant already exists for this client
                    const existingTenant = await TenantEntity.getByOwnerId(c.env, client.id);

                    if (existingTenant) {
                        results.push({
                            clientId: client.id,
                            clientCompany: client.company,
                            tenantId: existingTenant.id,
                            success: true,
                            error: 'Already migrated',
                        });
                        continue;
                    }

                    if (dryRun) {
                        results.push({
                            clientId: client.id,
                            clientCompany: client.company,
                            tenantId: 'DRY_RUN',
                            success: true,
                        });
                        continue;
                    }

                    // Create tenant for this client
                    const tenantId = crypto.randomUUID();
                    const slug = client.company
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                        .substring(0, 50) || `tenant-${Date.now()}`;

                    const tenant = await TenantEntity.create(c.env, {
                        id: tenantId,
                        name: client.company || 'My Workspace',
                        slug: slug,
                        ownerId: client.id,
                        plan: 'free' as TenantPlan,
                        branding: {},
                        settings: {
                            timezone: 'Asia/Karachi',
                            currency: 'PKR',
                        },
                    });

                    // Create a default CRM app for the tenant
                    const wizardData = {
                        businessType: businessType,
                        businessName: client.company || 'My Business',
                        name: `${client.company || 'My'} CRM`,
                        primaryColor: '#6366f1',
                    };

                    await createCrmFromWizard(
                        c.env,
                        tenant.id,
                        wizardData
                    );

                    results.push({
                        clientId: client.id,
                        clientCompany: client.company,
                        tenantId: tenant.id,
                        success: true,
                    });

                } catch (err) {
                    results.push({
                        clientId: client.id,
                        clientCompany: client.company,
                        tenantId: '',
                        success: false,
                        error: err instanceof Error ? err.message : 'Unknown error',
                    });
                }
            }

            const successCount = results.filter(r => r.success && !r.error?.includes('Already migrated')).length;
            const alreadyMigrated = results.filter(r => r.error?.includes('Already migrated')).length;
            const failedCount = results.filter(r => !r.success).length;

            return ok(c, {
                dryRun,
                totalClients: clients.length,
                migrated: successCount,
                alreadyMigrated,
                failed: failedCount,
                results,
            });

        } catch (err) {
            console.error('Migration error:', err);
            return bad(c, err instanceof Error ? err.message : 'Migration failed');
        }
    });

    // ===========================================
    // Get Migration Status
    // ===========================================

    app.get('/api/admin/migration-status', async (c) => {
        try {
            const { items: clients } = await ClientEntity.list(c.env);
            const tenants = await TenantEntity.list(c.env);

            // Check which clients have tenants
            const migratedClients = clients.filter(client =>
                tenants.some((t: Tenant) => t.ownerId === client.id)
            );

            return ok(c, {
                totalClients: clients.length,
                migratedClients: migratedClients.length,
                pendingClients: clients.length - migratedClients.length,
                totalTenants: tenants.length,
                clients: clients.map(client => ({
                    id: client.id,
                    company: client.company,
                    status: client.status,
                    migrated: tenants.some((t: Tenant) => t.ownerId === client.id),
                    tenantId: tenants.find((t: Tenant) => t.ownerId === client.id)?.id,
                })),
            });

        } catch (err) {
            console.error('Migration status error:', err);
            return bad(c, 'Failed to get migration status');
        }
    });

    // ===========================================
    // Migrate Single Client
    // ===========================================

    app.post('/api/admin/migrate-client/:clientId', async (c) => {
        const { clientId } = c.req.param();
        let businessType: BusinessType = 'services';

        try {
            const body = await c.req.json<{ businessType?: BusinessType }>();
            businessType = body.businessType ?? 'services';
        } catch {
            // Use default
        }

        try {
            // Get client
            const clientEntity = new ClientEntity(c.env, clientId);
            const client = await clientEntity.getState();

            if (!client.id) {
                return bad(c, 'Client not found');
            }

            // Check if already migrated
            const existingTenant = await TenantEntity.getByOwnerId(c.env, clientId);
            if (existingTenant) {
                return ok(c, {
                    success: true,
                    alreadyMigrated: true,
                    tenant: existingTenant,
                });
            }

            // Create tenant
            const tenantId = crypto.randomUUID();
            const slug = client.company
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50) || `tenant-${Date.now()}`;

            const tenant = await TenantEntity.create(c.env, {
                id: tenantId,
                name: client.company || 'My Workspace',
                slug: slug,
                ownerId: clientId,
                plan: 'free' as TenantPlan,
                branding: {},
                settings: {
                    timezone: 'Asia/Karachi',
                    currency: 'PKR',
                },
            });

            // Create default CRM
            const wizardData = {
                businessType: businessType,
                businessName: client.company || 'My Business',
                name: `${client.company || 'My'} CRM`,
                primaryColor: '#6366f1',
            };

            const { app: crmApp, modules } = await createCrmFromWizard(
                c.env,
                tenant.id,
                wizardData
            );

            return ok(c, {
                success: true,
                alreadyMigrated: false,
                tenant,
                crmApp,
                modulesCreated: modules.length,
            });

        } catch (err) {
            console.error('Single migration error:', err);
            return bad(c, err instanceof Error ? err.message : 'Migration failed');
        }
    });
}
