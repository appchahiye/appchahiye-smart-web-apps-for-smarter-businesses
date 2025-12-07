/**
 * AppChahiye SaaS Entities
 * Database operations for multi-tenant CRM platform
 */

import type { Env } from './core-utils';
import { queryAll, queryFirst, insert, updateById, deleteById } from './d1-utils';
import type {
    Tenant,
    TenantBranding,
    TenantSettings,
    CrmApp,
    CrmAppConfig,
    CrmAppBranding,
    CrmUser,
    CrmPermissions,
    Module,
    ModuleConfig,
    Field,
    FieldOptions,
    FieldValidation,
    Record,
    RecordData,
    View,
    ViewConfig,
    ViewFilter,
    ViewSort,
    Activity,
    ActivityMetadata,
    Relation,
    CrmFile,
    CrmSession,
    Pillar,
    BusinessType,
    FieldType,
    ViewType,
    ActivityType,
    CrmUserRole,
} from '@shared/saas-types';

// ============================================
// Row Types (snake_case from D1)
// ============================================

interface TenantRow {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    plan: string;
    branding: string;
    settings: string;
    created_at: number;
    updated_at: number;
}

interface CrmAppRow {
    id: string;
    tenant_id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    business_type: string;
    config: string;
    enabled_pillars: string;
    branding: string;
    is_active: number;
    created_at: number;
    updated_at: number;
}

interface CrmUserRow {
    id: string;
    app_id: string;
    email: string;
    name: string;
    password_hash: string;
    role: string;
    avatar_url: string | null;
    permissions: string;
    is_active: number;
    last_login_at: number | null;
    created_at: number;
    updated_at: number;
}

interface ModuleRow {
    id: string;
    app_id: string;
    pillar: string;
    system_name: string;
    display_name: string;
    description: string;
    icon: string;
    color: string;
    enabled: number;
    sort_order: number;
    config: string;
    created_at: number;
}

interface FieldRow {
    id: string;
    module_id: string;
    name: string;
    label: string;
    type: string;
    required: number;
    unique_field: number;
    default_value: string | null;
    placeholder: string | null;
    options: string;
    validation: string;
    sort_order: number;
    show_in_list: number;
    show_in_form: number;
    is_system: number;
    created_at: number;
}

interface RecordRow {
    id: string;
    app_id: string;
    module_id: string;
    data: string;
    created_by: string | null;
    updated_by: string | null;
    created_at: number;
    updated_at: number;
}

interface ViewRow {
    id: string;
    module_id: string;
    name: string;
    type: string;
    config: string;
    filters: string;
    sort: string;
    columns: string;
    grouping: string | null;
    is_default: number;
    is_shared: number;
    created_by: string | null;
    created_at: number;
    updated_at: number;
}

interface ActivityRow {
    id: string;
    record_id: string;
    type: string;
    content: string;
    metadata: string;
    created_by: string | null;
    created_at: number;
}

interface RelationRow {
    id: string;
    source_record_id: string;
    target_record_id: string;
    relation_type: string;
    metadata: string;
    created_at: number;
}

interface CrmFileRow {
    id: string;
    app_id: string;
    record_id: string | null;
    module_id: string | null;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    r2_key: string;
    uploaded_by: string | null;
    created_at: number;
}

interface CrmSessionRow {
    id: string;
    user_id: string;
    token: string;
    expires_at: number;
    created_at: number;
}

// ============================================
// Row to Model Converters
// ============================================

function tenantFromRow(row: TenantRow): Tenant {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        ownerId: row.owner_id,
        plan: row.plan as Tenant['plan'],
        branding: JSON.parse(row.branding || '{}') as TenantBranding,
        settings: JSON.parse(row.settings || '{}') as TenantSettings,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function crmAppFromRow(row: CrmAppRow): CrmApp {
    return {
        id: row.id,
        tenantId: row.tenant_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon: row.icon,
        businessType: row.business_type as BusinessType,
        config: JSON.parse(row.config || '{}') as CrmAppConfig,
        enabledPillars: JSON.parse(row.enabled_pillars || '[]') as Pillar[],
        branding: JSON.parse(row.branding || '{}') as CrmAppBranding,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function crmUserFromRow(row: CrmUserRow): CrmUser {
    return {
        id: row.id,
        appId: row.app_id,
        email: row.email,
        name: row.name,
        role: row.role as CrmUserRole,
        avatarUrl: row.avatar_url || undefined,
        permissions: JSON.parse(row.permissions || '{}') as CrmPermissions,
        isActive: Boolean(row.is_active),
        lastLoginAt: row.last_login_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function moduleFromRow(row: ModuleRow): Module {
    return {
        id: row.id,
        appId: row.app_id,
        pillar: row.pillar as Pillar,
        systemName: row.system_name,
        displayName: row.display_name,
        description: row.description,
        icon: row.icon,
        color: row.color,
        enabled: Boolean(row.enabled),
        sortOrder: row.sort_order,
        config: JSON.parse(row.config || '{}') as ModuleConfig,
        createdAt: row.created_at,
    };
}

function fieldFromRow(row: FieldRow): Field {
    return {
        id: row.id,
        moduleId: row.module_id,
        name: row.name,
        label: row.label,
        type: row.type as FieldType,
        required: Boolean(row.required),
        unique: Boolean(row.unique_field),
        defaultValue: row.default_value || undefined,
        placeholder: row.placeholder || undefined,
        options: JSON.parse(row.options || '{}') as FieldOptions,
        validation: JSON.parse(row.validation || '{}') as FieldValidation,
        sortOrder: row.sort_order,
        showInList: Boolean(row.show_in_list),
        showInForm: Boolean(row.show_in_form),
        isSystem: Boolean(row.is_system),
        createdAt: row.created_at,
    };
}

function recordFromRow(row: RecordRow): Record {
    return {
        id: row.id,
        appId: row.app_id,
        moduleId: row.module_id,
        data: JSON.parse(row.data || '{}') as RecordData,
        createdBy: row.created_by || undefined,
        updatedBy: row.updated_by || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function viewFromRow(row: ViewRow): View {
    return {
        id: row.id,
        moduleId: row.module_id,
        name: row.name,
        type: row.type as ViewType,
        config: JSON.parse(row.config || '{}') as ViewConfig,
        filters: JSON.parse(row.filters || '[]') as ViewFilter[],
        sort: JSON.parse(row.sort || '[]') as ViewSort[],
        columns: JSON.parse(row.columns || '[]') as string[],
        grouping: row.grouping || undefined,
        isDefault: Boolean(row.is_default),
        isShared: Boolean(row.is_shared),
        createdBy: row.created_by || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function activityFromRow(row: ActivityRow): Activity {
    return {
        id: row.id,
        recordId: row.record_id,
        type: row.type as ActivityType,
        content: row.content,
        metadata: JSON.parse(row.metadata || '{}') as ActivityMetadata,
        createdBy: row.created_by || undefined,
        createdAt: row.created_at,
    };
}

function relationFromRow(row: RelationRow): Relation {
    return {
        id: row.id,
        sourceRecordId: row.source_record_id,
        targetRecordId: row.target_record_id,
        relationType: row.relation_type,
        metadata: JSON.parse(row.metadata || '{}'),
        createdAt: row.created_at,
    };
}

function crmFileFromRow(row: CrmFileRow): CrmFile {
    return {
        id: row.id,
        appId: row.app_id,
        recordId: row.record_id || undefined,
        moduleId: row.module_id || undefined,
        name: row.name,
        originalName: row.original_name,
        mimeType: row.mime_type,
        size: row.size,
        r2Key: row.r2_key,
        uploadedBy: row.uploaded_by || undefined,
        createdAt: row.created_at,
    };
}

function crmSessionFromRow(row: CrmSessionRow): CrmSession {
    return {
        id: row.id,
        userId: row.user_id,
        token: row.token,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
    };
}

// ============================================
// Tenant Entity
// ============================================

export const TenantEntity = {
    async create(env: Env, data: Omit<Tenant, 'createdAt' | 'updatedAt'>): Promise<Tenant> {
        const now = Date.now();
        const row: TenantRow = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            owner_id: data.ownerId,
            plan: data.plan,
            branding: JSON.stringify(data.branding || {}),
            settings: JSON.stringify(data.settings || {}),
            created_at: now,
            updated_at: now,
        };
        await insert(env.DB, 'tenants', row);
        return tenantFromRow(row);
    },

    async getById(env: Env, id: string): Promise<Tenant | null> {
        const row = await queryFirst<TenantRow>(env.DB, 'SELECT * FROM tenants WHERE id = ?', [id]);
        return row ? tenantFromRow(row) : null;
    },

    async getBySlug(env: Env, slug: string): Promise<Tenant | null> {
        const row = await queryFirst<TenantRow>(env.DB, 'SELECT * FROM tenants WHERE slug = ?', [slug]);
        return row ? tenantFromRow(row) : null;
    },

    async getByOwnerId(env: Env, ownerId: string): Promise<Tenant | null> {
        const row = await queryFirst<TenantRow>(env.DB, 'SELECT * FROM tenants WHERE owner_id = ?', [ownerId]);
        return row ? tenantFromRow(row) : null;
    },

    async list(env: Env, limit = 100, offset = 0): Promise<Tenant[]> {
        const rows = await queryAll<TenantRow>(env.DB, 'SELECT * FROM tenants ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        return rows.map(tenantFromRow);
    },

    async update(env: Env, id: string, data: Partial<Tenant>): Promise<boolean> {
        const updates: Record<string, unknown> = { updated_at: Date.now() };
        if (data.name !== undefined) updates.name = data.name;
        if (data.plan !== undefined) updates.plan = data.plan;
        if (data.branding !== undefined) updates.branding = JSON.stringify(data.branding);
        if (data.settings !== undefined) updates.settings = JSON.stringify(data.settings);
        return updateById(env.DB, 'tenants', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'tenants', id);
    },

    async count(env: Env): Promise<number> {
        const result = await queryFirst<{ count: number }>(env.DB, 'SELECT COUNT(*) as count FROM tenants', []);
        return result?.count || 0;
    },
};

// ============================================
// CRM App Entity
// ============================================

export const CrmAppEntity = {
    async create(env: Env, data: Omit<CrmApp, 'createdAt' | 'updatedAt'>): Promise<CrmApp> {
        const now = Date.now();
        const row: CrmAppRow = {
            id: data.id,
            tenant_id: data.tenantId,
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            icon: data.icon || 'briefcase',
            business_type: data.businessType,
            config: JSON.stringify(data.config || {}),
            enabled_pillars: JSON.stringify(data.enabledPillars || ['people', 'work', 'money']),
            branding: JSON.stringify(data.branding || {}),
            is_active: data.isActive ? 1 : 0,
            created_at: now,
            updated_at: now,
        };
        await insert(env.DB, 'crm_apps', row);
        return crmAppFromRow(row);
    },

    async getById(env: Env, id: string): Promise<CrmApp | null> {
        const row = await queryFirst<CrmAppRow>(env.DB, 'SELECT * FROM crm_apps WHERE id = ?', [id]);
        return row ? crmAppFromRow(row) : null;
    },

    async getByTenantId(env: Env, tenantId: string): Promise<CrmApp[]> {
        const rows = await queryAll<CrmAppRow>(
            env.DB,
            'SELECT * FROM crm_apps WHERE tenant_id = ? ORDER BY created_at DESC',
            [tenantId]
        );
        return rows.map(crmAppFromRow);
    },

    async getByTenantSlug(env: Env, tenantId: string, slug: string): Promise<CrmApp | null> {
        const row = await queryFirst<CrmAppRow>(
            env.DB,
            'SELECT * FROM crm_apps WHERE tenant_id = ? AND slug = ?',
            [tenantId, slug]
        );
        return row ? crmAppFromRow(row) : null;
    },

    async update(env: Env, id: string, data: Partial<CrmApp>): Promise<boolean> {
        const updates: Record<string, unknown> = { updated_at: Date.now() };
        if (data.name !== undefined) updates.name = data.name;
        if (data.description !== undefined) updates.description = data.description;
        if (data.icon !== undefined) updates.icon = data.icon;
        if (data.config !== undefined) updates.config = JSON.stringify(data.config);
        if (data.enabledPillars !== undefined) updates.enabled_pillars = JSON.stringify(data.enabledPillars);
        if (data.branding !== undefined) updates.branding = JSON.stringify(data.branding);
        if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
        return updateById(env.DB, 'crm_apps', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'crm_apps', id);
    },

    async countByTenantId(env: Env, tenantId: string): Promise<number> {
        const result = await queryFirst<{ count: number }>(
            env.DB,
            'SELECT COUNT(*) as count FROM crm_apps WHERE tenant_id = ?',
            [tenantId]
        );
        return result?.count || 0;
    },
};

// ============================================
// CRM User Entity
// ============================================

export const CrmUserEntity = {
    async create(env: Env, data: Omit<CrmUser, 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<CrmUser> {
        const now = Date.now();
        const row: CrmUserRow = {
            id: data.id,
            app_id: data.appId,
            email: data.email,
            name: data.name,
            password_hash: data.passwordHash,
            role: data.role,
            avatar_url: data.avatarUrl || null,
            permissions: JSON.stringify(data.permissions || {}),
            is_active: data.isActive ? 1 : 0,
            last_login_at: data.lastLoginAt || null,
            created_at: now,
            updated_at: now,
        };
        await insert(env.DB, 'crm_users', row);
        return crmUserFromRow(row);
    },

    async getById(env: Env, id: string): Promise<CrmUser | null> {
        const row = await queryFirst<CrmUserRow>(env.DB, 'SELECT * FROM crm_users WHERE id = ?', [id]);
        return row ? crmUserFromRow(row) : null;
    },

    async getByEmail(env: Env, appId: string, email: string): Promise<{ user: CrmUser; passwordHash: string } | null> {
        const row = await queryFirst<CrmUserRow>(
            env.DB,
            'SELECT * FROM crm_users WHERE app_id = ? AND email = ?',
            [appId, email]
        );
        if (!row) return null;
        return { user: crmUserFromRow(row), passwordHash: row.password_hash };
    },

    async getByAppId(env: Env, appId: string): Promise<CrmUser[]> {
        const rows = await queryAll<CrmUserRow>(
            env.DB,
            'SELECT * FROM crm_users WHERE app_id = ? ORDER BY created_at DESC',
            [appId]
        );
        return rows.map(crmUserFromRow);
    },

    async update(env: Env, id: string, data: Partial<CrmUser> & { passwordHash?: string }): Promise<boolean> {
        const updates: Record<string, unknown> = { updated_at: Date.now() };
        if (data.name !== undefined) updates.name = data.name;
        if (data.role !== undefined) updates.role = data.role;
        if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;
        if (data.permissions !== undefined) updates.permissions = JSON.stringify(data.permissions);
        if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
        if (data.lastLoginAt !== undefined) updates.last_login_at = data.lastLoginAt;
        if (data.passwordHash !== undefined) updates.password_hash = data.passwordHash;
        return updateById(env.DB, 'crm_users', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'crm_users', id);
    },

    async countByAppId(env: Env, appId: string): Promise<number> {
        const result = await queryFirst<{ count: number }>(
            env.DB,
            'SELECT COUNT(*) as count FROM crm_users WHERE app_id = ?',
            [appId]
        );
        return result?.count || 0;
    },
};

// ============================================
// Module Entity
// ============================================

export const ModuleEntity = {
    async create(env: Env, data: Omit<Module, 'createdAt'>): Promise<Module> {
        const row: ModuleRow = {
            id: data.id,
            app_id: data.appId,
            pillar: data.pillar,
            system_name: data.systemName,
            display_name: data.displayName,
            description: data.description || '',
            icon: data.icon || 'folder',
            color: data.color || '#6366f1',
            enabled: data.enabled ? 1 : 0,
            sort_order: data.sortOrder || 0,
            config: JSON.stringify(data.config || {}),
            created_at: Date.now(),
        };
        await insert(env.DB, 'modules', row);
        return moduleFromRow(row);
    },

    async getById(env: Env, id: string): Promise<Module | null> {
        const row = await queryFirst<ModuleRow>(env.DB, 'SELECT * FROM modules WHERE id = ?', [id]);
        return row ? moduleFromRow(row) : null;
    },

    async getByAppId(env: Env, appId: string, enabledOnly = true): Promise<Module[]> {
        const query = enabledOnly
            ? 'SELECT * FROM modules WHERE app_id = ? AND enabled = 1 ORDER BY sort_order ASC'
            : 'SELECT * FROM modules WHERE app_id = ? ORDER BY sort_order ASC';
        const rows = await queryAll<ModuleRow>(env.DB, query, [appId]);
        return rows.map(moduleFromRow);
    },

    async getByPillar(env: Env, appId: string, pillar: Pillar): Promise<Module[]> {
        const rows = await queryAll<ModuleRow>(
            env.DB,
            'SELECT * FROM modules WHERE app_id = ? AND pillar = ? AND enabled = 1 ORDER BY sort_order ASC',
            [appId, pillar]
        );
        return rows.map(moduleFromRow);
    },

    async update(env: Env, id: string, data: Partial<Module>): Promise<boolean> {
        const updates: Record<string, unknown> = {};
        if (data.displayName !== undefined) updates.display_name = data.displayName;
        if (data.description !== undefined) updates.description = data.description;
        if (data.icon !== undefined) updates.icon = data.icon;
        if (data.color !== undefined) updates.color = data.color;
        if (data.enabled !== undefined) updates.enabled = data.enabled ? 1 : 0;
        if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
        if (data.config !== undefined) updates.config = JSON.stringify(data.config);
        return updateById(env.DB, 'modules', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'modules', id);
    },
};

// ============================================
// Field Entity
// ============================================

export const FieldEntity = {
    async create(env: Env, data: Omit<Field, 'createdAt'>): Promise<Field> {
        const row: FieldRow = {
            id: data.id,
            module_id: data.moduleId,
            name: data.name,
            label: data.label,
            type: data.type,
            required: data.required ? 1 : 0,
            unique_field: data.unique ? 1 : 0,
            default_value: data.defaultValue || null,
            placeholder: data.placeholder || null,
            options: JSON.stringify(data.options || {}),
            validation: JSON.stringify(data.validation || {}),
            sort_order: data.sortOrder || 0,
            show_in_list: data.showInList ? 1 : 0,
            show_in_form: data.showInForm !== false ? 1 : 0,
            is_system: data.isSystem ? 1 : 0,
            created_at: Date.now(),
        };
        await insert(env.DB, 'fields', row);
        return fieldFromRow(row);
    },

    async getById(env: Env, id: string): Promise<Field | null> {
        const row = await queryFirst<FieldRow>(env.DB, 'SELECT * FROM fields WHERE id = ?', [id]);
        return row ? fieldFromRow(row) : null;
    },

    async getByModuleId(env: Env, moduleId: string): Promise<Field[]> {
        const rows = await queryAll<FieldRow>(
            env.DB,
            'SELECT * FROM fields WHERE module_id = ? ORDER BY sort_order ASC',
            [moduleId]
        );
        return rows.map(fieldFromRow);
    },

    async update(env: Env, id: string, data: Partial<Field>): Promise<boolean> {
        const updates: Record<string, unknown> = {};
        if (data.label !== undefined) updates.label = data.label;
        if (data.required !== undefined) updates.required = data.required ? 1 : 0;
        if (data.unique !== undefined) updates.unique_field = data.unique ? 1 : 0;
        if (data.defaultValue !== undefined) updates.default_value = data.defaultValue;
        if (data.placeholder !== undefined) updates.placeholder = data.placeholder;
        if (data.options !== undefined) updates.options = JSON.stringify(data.options);
        if (data.validation !== undefined) updates.validation = JSON.stringify(data.validation);
        if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
        if (data.showInList !== undefined) updates.show_in_list = data.showInList ? 1 : 0;
        if (data.showInForm !== undefined) updates.show_in_form = data.showInForm ? 1 : 0;
        return updateById(env.DB, 'fields', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'fields', id);
    },
};

// ============================================
// Record Entity
// ============================================

export const RecordEntity = {
    async create(env: Env, data: Omit<Record, 'createdAt' | 'updatedAt'>): Promise<Record> {
        const now = Date.now();
        const row: RecordRow = {
            id: data.id,
            app_id: data.appId,
            module_id: data.moduleId,
            data: JSON.stringify(data.data || {}),
            created_by: data.createdBy || null,
            updated_by: data.updatedBy || null,
            created_at: now,
            updated_at: now,
        };
        await insert(env.DB, 'records', row);
        return recordFromRow(row);
    },

    async getById(env: Env, id: string): Promise<Record | null> {
        const row = await queryFirst<RecordRow>(env.DB, 'SELECT * FROM records WHERE id = ?', [id]);
        return row ? recordFromRow(row) : null;
    },

    async getByModuleId(env: Env, moduleId: string, limit = 100, offset = 0): Promise<Record[]> {
        const rows = await queryAll<RecordRow>(
            env.DB,
            'SELECT * FROM records WHERE module_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [moduleId, limit, offset]
        );
        return rows.map(recordFromRow);
    },

    async getByAppId(env: Env, appId: string, limit = 100): Promise<Record[]> {
        const rows = await queryAll<RecordRow>(
            env.DB,
            'SELECT * FROM records WHERE app_id = ? ORDER BY created_at DESC LIMIT ?',
            [appId, limit]
        );
        return rows.map(recordFromRow);
    },

    async countByModuleId(env: Env, moduleId: string): Promise<number> {
        const result = await queryFirst<{ count: number }>(
            env.DB,
            'SELECT COUNT(*) as count FROM records WHERE module_id = ?',
            [moduleId]
        );
        return result?.count || 0;
    },

    async countByAppId(env: Env, appId: string): Promise<number> {
        const result = await queryFirst<{ count: number }>(
            env.DB,
            'SELECT COUNT(*) as count FROM records WHERE app_id = ?',
            [appId]
        );
        return result?.count || 0;
    },

    async update(env: Env, id: string, data: RecordData, updatedBy?: string): Promise<boolean> {
        return updateById(env.DB, 'records', id, {
            data: JSON.stringify(data),
            updated_by: updatedBy || null,
            updated_at: Date.now(),
        });
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'records', id);
    },

    async search(env: Env, moduleId: string, searchTerm: string, limit = 50): Promise<Record[]> {
        // Simple JSON search - more complex search can be added later
        const rows = await queryAll<RecordRow>(
            env.DB,
            `SELECT * FROM records WHERE module_id = ? AND data LIKE ? ORDER BY created_at DESC LIMIT ?`,
            [moduleId, `%${searchTerm}%`, limit]
        );
        return rows.map(recordFromRow);
    },
};

// ============================================
// View Entity
// ============================================

export const ViewEntity = {
    async create(env: Env, data: Omit<View, 'createdAt' | 'updatedAt'>): Promise<View> {
        const now = Date.now();
        const row: ViewRow = {
            id: data.id,
            module_id: data.moduleId,
            name: data.name,
            type: data.type,
            config: JSON.stringify(data.config || {}),
            filters: JSON.stringify(data.filters || []),
            sort: JSON.stringify(data.sort || []),
            columns: JSON.stringify(data.columns || []),
            grouping: data.grouping || null,
            is_default: data.isDefault ? 1 : 0,
            is_shared: data.isShared !== false ? 1 : 0,
            created_by: data.createdBy || null,
            created_at: now,
            updated_at: now,
        };
        await insert(env.DB, 'views', row);
        return viewFromRow(row);
    },

    async getById(env: Env, id: string): Promise<View | null> {
        const row = await queryFirst<ViewRow>(env.DB, 'SELECT * FROM views WHERE id = ?', [id]);
        return row ? viewFromRow(row) : null;
    },

    async getByModuleId(env: Env, moduleId: string): Promise<View[]> {
        const rows = await queryAll<ViewRow>(
            env.DB,
            'SELECT * FROM views WHERE module_id = ? ORDER BY is_default DESC, created_at ASC',
            [moduleId]
        );
        return rows.map(viewFromRow);
    },

    async getDefaultView(env: Env, moduleId: string): Promise<View | null> {
        const row = await queryFirst<ViewRow>(
            env.DB,
            'SELECT * FROM views WHERE module_id = ? AND is_default = 1',
            [moduleId]
        );
        return row ? viewFromRow(row) : null;
    },

    async update(env: Env, id: string, data: Partial<View>): Promise<boolean> {
        const updates: Record<string, unknown> = { updated_at: Date.now() };
        if (data.name !== undefined) updates.name = data.name;
        if (data.type !== undefined) updates.type = data.type;
        if (data.config !== undefined) updates.config = JSON.stringify(data.config);
        if (data.filters !== undefined) updates.filters = JSON.stringify(data.filters);
        if (data.sort !== undefined) updates.sort = JSON.stringify(data.sort);
        if (data.columns !== undefined) updates.columns = JSON.stringify(data.columns);
        if (data.grouping !== undefined) updates.grouping = data.grouping;
        if (data.isDefault !== undefined) updates.is_default = data.isDefault ? 1 : 0;
        if (data.isShared !== undefined) updates.is_shared = data.isShared ? 1 : 0;
        return updateById(env.DB, 'views', id, updates);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'views', id);
    },
};

// ============================================
// Activity Entity
// ============================================

export const ActivityEntity = {
    async create(env: Env, data: Omit<Activity, 'createdAt'>): Promise<Activity> {
        const row: ActivityRow = {
            id: data.id,
            record_id: data.recordId,
            type: data.type,
            content: data.content,
            metadata: JSON.stringify(data.metadata || {}),
            created_by: data.createdBy || null,
            created_at: Date.now(),
        };
        await insert(env.DB, 'activities', row);
        return activityFromRow(row);
    },

    async getByRecordId(env: Env, recordId: string, limit = 50): Promise<Activity[]> {
        const rows = await queryAll<ActivityRow>(
            env.DB,
            'SELECT * FROM activities WHERE record_id = ? ORDER BY created_at DESC LIMIT ?',
            [recordId, limit]
        );
        return rows.map(activityFromRow);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'activities', id);
    },
};

// ============================================
// Relation Entity
// ============================================

export const RelationEntity = {
    async create(env: Env, data: Omit<Relation, 'createdAt'>): Promise<Relation> {
        const row: RelationRow = {
            id: data.id,
            source_record_id: data.sourceRecordId,
            target_record_id: data.targetRecordId,
            relation_type: data.relationType,
            metadata: JSON.stringify(data.metadata || {}),
            created_at: Date.now(),
        };
        await insert(env.DB, 'relations', row);
        return relationFromRow(row);
    },

    async getBySourceId(env: Env, sourceRecordId: string): Promise<Relation[]> {
        const rows = await queryAll<RelationRow>(
            env.DB,
            'SELECT * FROM relations WHERE source_record_id = ?',
            [sourceRecordId]
        );
        return rows.map(relationFromRow);
    },

    async getByTargetId(env: Env, targetRecordId: string): Promise<Relation[]> {
        const rows = await queryAll<RelationRow>(
            env.DB,
            'SELECT * FROM relations WHERE target_record_id = ?',
            [targetRecordId]
        );
        return rows.map(relationFromRow);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'relations', id);
    },
};

// ============================================
// CRM File Entity
// ============================================

export const CrmFileEntity = {
    async create(env: Env, data: Omit<CrmFile, 'createdAt'>): Promise<CrmFile> {
        const row: CrmFileRow = {
            id: data.id,
            app_id: data.appId,
            record_id: data.recordId || null,
            module_id: data.moduleId || null,
            name: data.name,
            original_name: data.originalName,
            mime_type: data.mimeType,
            size: data.size,
            r2_key: data.r2Key,
            uploaded_by: data.uploadedBy || null,
            created_at: Date.now(),
        };
        await insert(env.DB, 'crm_files', row);
        return crmFileFromRow(row);
    },

    async getById(env: Env, id: string): Promise<CrmFile | null> {
        const row = await queryFirst<CrmFileRow>(env.DB, 'SELECT * FROM crm_files WHERE id = ?', [id]);
        return row ? crmFileFromRow(row) : null;
    },

    async getByRecordId(env: Env, recordId: string): Promise<CrmFile[]> {
        const rows = await queryAll<CrmFileRow>(
            env.DB,
            'SELECT * FROM crm_files WHERE record_id = ? ORDER BY created_at DESC',
            [recordId]
        );
        return rows.map(crmFileFromRow);
    },

    async delete(env: Env, id: string): Promise<boolean> {
        return deleteById(env.DB, 'crm_files', id);
    },
};

// ============================================
// CRM Session Entity
// ============================================

export const CrmSessionEntity = {
    async create(env: Env, data: Omit<CrmSession, 'createdAt'>): Promise<CrmSession> {
        const row: CrmSessionRow = {
            id: data.id,
            user_id: data.userId,
            token: data.token,
            expires_at: data.expiresAt,
            created_at: Date.now(),
        };
        await insert(env.DB, 'crm_sessions', row);
        return crmSessionFromRow(row);
    },

    async getByToken(env: Env, token: string): Promise<CrmSession | null> {
        const row = await queryFirst<CrmSessionRow>(
            env.DB,
            'SELECT * FROM crm_sessions WHERE token = ? AND expires_at > ?',
            [token, Date.now()]
        );
        return row ? crmSessionFromRow(row) : null;
    },

    async deleteByUserId(env: Env, userId: string): Promise<boolean> {
        const result = await env.DB.prepare('DELETE FROM crm_sessions WHERE user_id = ?').bind(userId).run();
        return result.success;
    },

    async deleteExpired(env: Env): Promise<number> {
        const result = await env.DB.prepare('DELETE FROM crm_sessions WHERE expires_at < ?').bind(Date.now()).run();
        return result.meta.changes || 0;
    },
};
