/**
 * AppChahiye SaaS API Routes
 * 
 * API endpoints for multi-tenant CRM platform.
 */

import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { TenantEntity, CrmAppEntity, ModuleEntity, FieldEntity, RecordEntity, ViewEntity, ActivityEntity, CrmUserEntity } from './saas-entities';
import { createCrmFromWizard, previewCrmStructure, BUSINESS_PRESETS, PILLARS } from './crm';
import type { CrmWizardData, Pillar } from '@shared/saas-types';

/**
 * Register all SaaS routes on the Hono app
 */
export function registerSaasRoutes(app: Hono<{ Bindings: Env }>) {

    // ===========================================
    // Tenant Routes
    // ===========================================

    // Get tenant by owner ID (for logged-in user)
    app.get('/api/saas/my-tenant', async (c) => {
        const userId = c.req.query('userId');
        if (!userId) {
            return bad(c, 'userId is required');
        }

        let tenant = await TenantEntity.getByOwnerId(c.env, userId);

        // Auto-create tenant if doesn't exist (for existing users)
        if (!tenant) {
            const slug = `tenant-${userId.substring(0, 8)}`;
            tenant = await TenantEntity.create(c.env, {
                id: crypto.randomUUID(),
                name: 'My Workspace',
                slug,
                ownerId: userId,
                plan: 'free',
                branding: {},
                settings: {},
            });
        }

        return ok(c, { tenant });
    });

    // List all tenants (admin only)
    app.get('/api/saas/tenants', async (c) => {
        const tenants = await TenantEntity.list(c.env);
        return ok(c, { tenants });
    });

    // Get tenant by owner ID (without auto-creation)
    app.get('/api/saas/tenants/by-owner/:ownerId', async (c) => {
        const { ownerId } = c.req.param();
        const tenant = await TenantEntity.getByOwnerId(c.env, ownerId);

        if (!tenant) {
            return notFound(c, 'Tenant not found for this owner');
        }

        return ok(c, { tenant });
    });

    // Get single tenant by ID
    app.get('/api/saas/tenants/:tenantId', async (c) => {
        const { tenantId } = c.req.param();
        const tenant = await TenantEntity.getById(c.env, tenantId);

        if (!tenant) {
            return notFound(c, 'Tenant not found');
        }

        return ok(c, tenant);
    });

    // Update tenant
    app.put('/api/saas/tenants/:tenantId', async (c) => {
        const { tenantId } = c.req.param();
        const body = await c.req.json();

        const success = await TenantEntity.update(c.env, tenantId, body as Parameters<typeof TenantEntity.update>[2]);
        if (!success) {
            return notFound(c, 'Tenant not found');
        }

        const updated = await TenantEntity.getById(c.env, tenantId);
        return ok(c, updated);
    });

    // ===========================================
    // CRM Wizard Routes
    // ===========================================

    // Get business presets (for wizard)
    app.get('/api/saas/presets', async (c) => {
        return ok(c, { presets: BUSINESS_PRESETS });
    });

    // Get pillars (for wizard)
    app.get('/api/saas/pillars', async (c) => {
        return ok(c, { pillars: PILLARS.map(p => ({ id: p.id, name: p.name, description: p.description, icon: p.icon, color: p.color })) });
    });

    // Preview CRM structure before creation
    app.get('/api/saas/preview/:businessType', async (c) => {
        const { businessType } = c.req.param();
        const preview = previewCrmStructure(businessType as Parameters<typeof previewCrmStructure>[0]);
        return ok(c, preview);
    });

    // ===========================================
    // CRM App Routes
    // ===========================================

    // Get apps for a tenant
    app.get('/api/saas/tenants/:tenantId/apps', async (c) => {
        const { tenantId } = c.req.param();
        const apps = await CrmAppEntity.getByTenantId(c.env, tenantId);
        return ok(c, { apps });
    });

    // Create new CRM app (wizard completion)
    app.post('/api/saas/tenants/:tenantId/apps', async (c) => {
        const { tenantId } = c.req.param();

        const tenant = await TenantEntity.getById(c.env, tenantId);
        if (!tenant) {
            return notFound(c, 'Tenant not found');
        }

        const wizardData = await c.req.json<CrmWizardData>();

        if (!wizardData.businessType || !wizardData.name) {
            return bad(c, 'businessType and name are required');
        }

        try {
            const result = await createCrmFromWizard(c.env, tenantId, wizardData);
            return ok(c, result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('CRM creation failed:', errorMessage, error);
            return bad(c, `Failed to create CRM: ${errorMessage}`);
        }
    });

    // Get single CRM app  
    app.get('/api/saas/apps/:appId', async (c) => {
        const { appId } = c.req.param();
        const app = await CrmAppEntity.getById(c.env, appId);

        if (!app) {
            return notFound(c, 'App not found');
        }

        const modules = await ModuleEntity.getByAppId(c.env, appId);
        return ok(c, { app, modules });
    });

    // Update CRM app
    app.put('/api/saas/apps/:appId', async (c) => {
        const { appId } = c.req.param();
        const body = await c.req.json();

        const success = await CrmAppEntity.update(c.env, appId, body as Parameters<typeof CrmAppEntity.update>[2]);
        if (!success) {
            return notFound(c, 'App not found');
        }

        const updated = await CrmAppEntity.getById(c.env, appId);
        return ok(c, updated);
    });

    // Delete CRM app
    app.delete('/api/saas/apps/:appId', async (c) => {
        const { appId } = c.req.param();
        const success = await CrmAppEntity.delete(c.env, appId);

        if (!success) {
            return notFound(c, 'App not found');
        }

        return ok(c, { deleted: true });
    });

    // ===========================================
    // Module Routes
    // ===========================================

    // Get modules for an app
    app.get('/api/saas/apps/:appId/modules', async (c) => {
        const { appId } = c.req.param();
        const modules = await ModuleEntity.getByAppId(c.env, appId);
        return ok(c, { modules });
    });

    // Get single module with fields
    app.get('/api/saas/modules/:moduleId', async (c) => {
        const { moduleId } = c.req.param();
        const module = await ModuleEntity.getById(c.env, moduleId);

        if (!module) {
            return notFound(c, 'Module not found');
        }

        const fields = await FieldEntity.getByModuleId(c.env, moduleId);
        const views = await ViewEntity.getByModuleId(c.env, moduleId);

        return ok(c, { module, fields, views });
    });

    // Update module
    app.put('/api/saas/modules/:moduleId', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json();

        const success = await ModuleEntity.update(c.env, moduleId, body as Parameters<typeof ModuleEntity.update>[2]);
        if (!success) {
            return notFound(c, 'Module not found');
        }

        const updated = await ModuleEntity.getById(c.env, moduleId);
        return ok(c, updated);
    });

    // ===========================================
    // Field Routes
    // ===========================================

    // Get fields for a module
    app.get('/api/saas/modules/:moduleId/fields', async (c) => {
        const { moduleId } = c.req.param();
        const fields = await FieldEntity.getByModuleId(c.env, moduleId);
        return ok(c, { fields });
    });

    // Create new field
    app.post('/api/saas/modules/:moduleId/fields', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json<{
            name: string;
            label: string;
            type: string;
            required?: boolean;
            placeholder?: string;
            options?: object;
        }>();

        if (!body.name || !body.label || !body.type) {
            return bad(c, 'name, label, and type are required');
        }

        const fields = await FieldEntity.getByModuleId(c.env, moduleId);
        const maxOrder = fields.reduce((max, f) => Math.max(max, f.sortOrder), 0);

        const field = await FieldEntity.create(c.env, {
            id: crypto.randomUUID(),
            moduleId,
            name: body.name,
            label: body.label,
            type: body.type as Parameters<typeof FieldEntity.create>[1]['type'],
            required: body.required || false,
            unique: false,
            placeholder: body.placeholder,
            options: (body.options || {}) as Parameters<typeof FieldEntity.create>[1]['options'],
            validation: {},
            sortOrder: maxOrder + 1,
            showInList: true,
            showInForm: true,
            isSystem: false,
        });

        return ok(c, field);
    });

    // Update field
    app.put('/api/saas/fields/:fieldId', async (c) => {
        const { fieldId } = c.req.param();
        const body = await c.req.json();

        const success = await FieldEntity.update(c.env, fieldId, body as Parameters<typeof FieldEntity.update>[2]);
        return ok(c, { success });
    });

    // Delete field
    app.delete('/api/saas/fields/:fieldId', async (c) => {
        const { fieldId } = c.req.param();
        const success = await FieldEntity.delete(c.env, fieldId);
        return ok(c, { deleted: success });
    });

    // ===========================================
    // Record Routes (The actual CRM data)
    // ===========================================

    // List records for a module
    app.get('/api/saas/modules/:moduleId/records', async (c) => {
        const { moduleId } = c.req.param();
        const limit = parseInt(c.req.query('limit') || '100');
        const offset = parseInt(c.req.query('offset') || '0');

        const records = await RecordEntity.getByModuleId(c.env, moduleId, limit, offset);
        const total = await RecordEntity.countByModuleId(c.env, moduleId);

        return ok(c, { records, total, limit, offset });
    });

    // Get single record
    app.get('/api/saas/records/:recordId', async (c) => {
        const { recordId } = c.req.param();
        const record = await RecordEntity.getById(c.env, recordId);

        if (!record) {
            return notFound(c, 'Record not found');
        }

        const activities = await ActivityEntity.getByRecordId(c.env, recordId);
        return ok(c, { record, activities });
    });

    // Create record
    app.post('/api/saas/modules/:moduleId/records', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json<{ data: Record<string, unknown>; createdBy?: string }>();

        const module = await ModuleEntity.getById(c.env, moduleId);
        if (!module) {
            return notFound(c, 'Module not found');
        }

        const record = await RecordEntity.create(c.env, {
            id: crypto.randomUUID(),
            appId: module.appId,
            moduleId,
            data: body.data || {},
            createdBy: body.createdBy,
            updatedBy: body.createdBy,
        });

        return ok(c, record);
    });

    // Update record
    app.put('/api/saas/records/:recordId', async (c) => {
        const { recordId } = c.req.param();
        const body = await c.req.json<{ data: Record<string, unknown>; updatedBy?: string }>();

        const existing = await RecordEntity.getById(c.env, recordId);
        if (!existing) {
            return notFound(c, 'Record not found');
        }

        const newData = { ...existing.data, ...body.data };
        const success = await RecordEntity.update(c.env, recordId, newData, body.updatedBy);

        if (success) {
            const updated = await RecordEntity.getById(c.env, recordId);
            return ok(c, updated);
        }

        return bad(c, 'Failed to update record');
    });

    // Delete record
    app.delete('/api/saas/records/:recordId', async (c) => {
        const { recordId } = c.req.param();
        const success = await RecordEntity.delete(c.env, recordId);
        return ok(c, { deleted: success });
    });

    // ===========================================
    // Activity Routes
    // ===========================================

    // Add activity to record
    app.post('/api/saas/records/:recordId/activities', async (c) => {
        const { recordId } = c.req.param();
        const body = await c.req.json<{
            type: string;
            content: string;
            createdBy?: string;
        }>();

        if (!body.type || !body.content) {
            return bad(c, 'type and content are required');
        }

        const activity = await ActivityEntity.create(c.env, {
            id: crypto.randomUUID(),
            recordId,
            type: body.type as Parameters<typeof ActivityEntity.create>[1]['type'],
            content: body.content,
            metadata: {},
            createdBy: body.createdBy,
        });

        return ok(c, activity);
    });

    // ===========================================
    // View Routes
    // ===========================================

    // Get views for a module
    app.get('/api/saas/modules/:moduleId/views', async (c) => {
        const { moduleId } = c.req.param();
        const views = await ViewEntity.getByModuleId(c.env, moduleId);
        return ok(c, { views });
    });

    // Create view
    app.post('/api/saas/modules/:moduleId/views', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json<{
            name: string;
            type: string;
            config?: object;
            columns?: string[];
        }>();

        if (!body.name || !body.type) {
            return bad(c, 'name and type are required');
        }

        const view = await ViewEntity.create(c.env, {
            id: crypto.randomUUID(),
            moduleId,
            name: body.name,
            type: body.type as Parameters<typeof ViewEntity.create>[1]['type'],
            config: (body.config || {}) as Parameters<typeof ViewEntity.create>[1]['config'],
            filters: [],
            sort: [],
            columns: body.columns || [],
            isDefault: false,
            isShared: true,
        });

        return ok(c, view);
    });

    // Update view
    app.put('/api/saas/views/:viewId', async (c) => {
        const { viewId } = c.req.param();
        const body = await c.req.json();

        const success = await ViewEntity.update(c.env, viewId, body as Parameters<typeof ViewEntity.update>[2]);
        return ok(c, { success });
    });

    // Delete view
    app.delete('/api/saas/views/:viewId', async (c) => {
        const { viewId } = c.req.param();
        const success = await ViewEntity.delete(c.env, viewId);
        return ok(c, { deleted: success });
    });

    // ===========================================
    // Dashboard Stats Routes
    // ===========================================

    // Get tenant dashboard stats
    app.get('/api/saas/tenants/:tenantId/stats', async (c) => {
        const { tenantId } = c.req.param();

        const apps = await CrmAppEntity.getByTenantId(c.env, tenantId);
        let totalRecords = 0;
        let totalCrmUsers = 0;

        for (const app of apps) {
            totalRecords += await RecordEntity.countByAppId(c.env, app.id);
            totalCrmUsers += await CrmUserEntity.countByAppId(c.env, app.id);
        }

        const tenant = await TenantEntity.getById(c.env, tenantId);

        return ok(c, {
            totalApps: apps.length,
            totalRecords,
            totalCrmUsers,
            plan: tenant?.plan || 'free',
            apps: apps.slice(0, 5), // Recent 5 apps
        });
    });

    // Get CRM app dashboard stats
    app.get('/api/saas/apps/:appId/stats', async (c) => {
        const { appId } = c.req.param();

        const modules = await ModuleEntity.getByAppId(c.env, appId);
        const moduleStats = await Promise.all(
            modules.map(async (m) => ({
                moduleId: m.id,
                moduleName: m.displayName,
                recordCount: await RecordEntity.countByModuleId(c.env, m.id),
            }))
        );

        const totalRecords = moduleStats.reduce((sum, s) => sum + s.recordCount, 0);
        const totalUsers = await CrmUserEntity.countByAppId(c.env, appId);
        const recentRecords = await RecordEntity.getByAppId(c.env, appId, 10);

        return ok(c, {
            totalRecords,
            totalUsers,
            moduleStats,
            recentRecords,
        });
    });
}
