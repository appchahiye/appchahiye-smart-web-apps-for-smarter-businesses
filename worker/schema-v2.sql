-- ============================================
-- AppChahiye SaaS Schema v2
-- Multi-Tenant CRM Platform
-- ============================================
-- Run with: npx wrangler d1 execute appchahiye-db --remote --file=./worker/schema-v2.sql
-- For local: npx wrangler d1 execute appchahiye-db --local --file=./worker/schema-v2.sql

-- ============================================
-- TENANTS (Business Workspaces)
-- ============================================
-- Each AppChahiye user gets one personal tenant
-- Tenants can create multiple CRM apps

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'starter', 'pro', 'enterprise')),
    branding TEXT DEFAULT '{}',
    settings TEXT DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
    -- Note: owner_id is not FK constrained to users table
    -- because tenant owners may be registered via different auth flows
);

CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);


-- ============================================
-- CRM APPS (CRM Instances per Tenant)
-- ============================================
-- Each CRM is a complete application with its own
-- modules, users, records, and configuration

CREATE TABLE IF NOT EXISTS crm_apps (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'briefcase',
    business_type TEXT NOT NULL,
    config TEXT DEFAULT '{}',
    enabled_pillars TEXT DEFAULT '["people","work","money"]',
    branding TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_crm_apps_tenant ON crm_apps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_apps_active ON crm_apps(tenant_id, is_active);


-- ============================================
-- CRM USERS (Separate from AppChahiye Users)
-- ============================================
-- Each CRM has its own user system with roles
-- These users can only access the specific CRM

CREATE TABLE IF NOT EXISTS crm_users (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member', 'viewer')),
    avatar_url TEXT,
    permissions TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE,
    UNIQUE(app_id, email)
);

CREATE INDEX IF NOT EXISTS idx_crm_users_app ON crm_users(app_id);
CREATE INDEX IF NOT EXISTS idx_crm_users_email ON crm_users(app_id, email);
CREATE INDEX IF NOT EXISTS idx_crm_users_active ON crm_users(app_id, is_active);


-- ============================================
-- MODULES (Configurable Modules per CRM)
-- ============================================
-- Modules belong to a pillar and can be
-- enabled/disabled, renamed per CRM

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    pillar TEXT NOT NULL CHECK(pillar IN ('people','work','money','stock','time','places','files','talk','reports','settings')),
    system_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#6366f1',
    enabled INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    config TEXT DEFAULT '{}',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_modules_app ON modules(app_id);
CREATE INDEX IF NOT EXISTS idx_modules_pillar ON modules(app_id, pillar);
CREATE INDEX IF NOT EXISTS idx_modules_enabled ON modules(app_id, enabled);


-- ============================================
-- FIELDS (Dynamic Field Definitions)
-- ============================================
-- Fields define the structure of records
-- Stored as metadata, not as database columns

CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN (
        'text', 'textarea', 'number', 'email', 'phone', 'url',
        'date', 'datetime', 'select', 'multiselect', 'checkbox',
        'file', 'image', 'relation', 'currency', 'rating', 'color'
    )),
    required INTEGER DEFAULT 0,
    unique_field INTEGER DEFAULT 0,
    default_value TEXT,
    placeholder TEXT,
    options TEXT DEFAULT '{}',
    validation TEXT DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    show_in_list INTEGER DEFAULT 1,
    show_in_form INTEGER DEFAULT 1,
    is_system INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fields_module ON fields(module_id);
CREATE INDEX IF NOT EXISTS idx_fields_type ON fields(module_id, type);


-- ============================================
-- RECORDS (Actual CRM Data - JSON Storage)
-- ============================================
-- Records store data as JSON for flexibility
-- Each record belongs to a module

CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    created_by TEXT,
    updated_by TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_records_app ON records(app_id);
CREATE INDEX IF NOT EXISTS idx_records_module ON records(module_id);
CREATE INDEX IF NOT EXISTS idx_records_app_module ON records(app_id, module_id);
CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_updated ON records(updated_at DESC);


-- ============================================
-- VIEWS (Saved View Configurations)
-- ============================================
-- Views define how records are displayed
-- Includes filters, sorting, column visibility

CREATE TABLE IF NOT EXISTS views (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'table' CHECK(type IN ('table', 'kanban', 'calendar', 'list', 'board', 'gallery')),
    config TEXT DEFAULT '{}',
    filters TEXT DEFAULT '[]',
    sort TEXT DEFAULT '[]',
    columns TEXT DEFAULT '[]',
    grouping TEXT,
    is_default INTEGER DEFAULT 0,
    is_shared INTEGER DEFAULT 1,
    created_by TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_views_module ON views(module_id);
CREATE INDEX IF NOT EXISTS idx_views_default ON views(module_id, is_default);


-- ============================================
-- ACTIVITIES (Notes, Comments, History)
-- ============================================
-- Activities track all actions on records
-- Used for audit trail and collaboration

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('note', 'comment', 'status_change', 'field_update', 'file_added', 'created', 'deleted', 'restored')),
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_by TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_record ON activities(record_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(record_id, type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);


-- ============================================
-- RELATIONS (Links Between Records)
-- ============================================
-- Enables linking records across modules
-- E.g., Contact -> Company, Task -> Project

CREATE TABLE IF NOT EXISTS relations (
    id TEXT PRIMARY KEY,
    source_record_id TEXT NOT NULL,
    target_record_id TEXT NOT NULL,
    relation_type TEXT DEFAULT 'link',
    metadata TEXT DEFAULT '{}',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (source_record_id) REFERENCES records(id) ON DELETE CASCADE,
    FOREIGN KEY (target_record_id) REFERENCES records(id) ON DELETE CASCADE,
    UNIQUE(source_record_id, target_record_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_relations_source ON relations(source_record_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target_record_id);


-- ============================================
-- FILES (File Attachments in CRM)
-- ============================================
-- Tracks files uploaded to CRM records
-- Actual files stored in R2

CREATE TABLE IF NOT EXISTS crm_files (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    record_id TEXT,
    module_id TEXT,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    r2_key TEXT NOT NULL,
    uploaded_by TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_files_app ON crm_files(app_id);
CREATE INDEX IF NOT EXISTS idx_crm_files_record ON crm_files(record_id);


-- ============================================
-- AUTOMATION RULES (Future: Workflow Engine)
-- ============================================
-- Placeholder for automation/workflow rules
-- Will be implemented in future phase

CREATE TABLE IF NOT EXISTS automation_rules (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    trigger_event TEXT NOT NULL,
    trigger_module_id TEXT,
    conditions TEXT DEFAULT '[]',
    actions TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    run_count INTEGER DEFAULT 0,
    last_run_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_automation_app ON automation_rules(app_id);


-- ============================================
-- POS TABLES (Architecture Only)
-- ============================================
-- Minimal structure for future POS integration

CREATE TABLE IF NOT EXISTS pos_transactions (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('sale', 'refund', 'void')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
    subtotal INTEGER NOT NULL,
    tax INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    payment_method TEXT,
    customer_record_id TEXT,
    line_items TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    created_by TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    FOREIGN KEY (app_id) REFERENCES crm_apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pos_app ON pos_transactions(app_id);
CREATE INDEX IF NOT EXISTS idx_pos_status ON pos_transactions(app_id, status);
CREATE INDEX IF NOT EXISTS idx_pos_created ON pos_transactions(created_at DESC);


-- ============================================
-- SESSION TOKENS (For CRM User Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS crm_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES crm_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crm_sessions_user ON crm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_sessions_token ON crm_sessions(token);
CREATE INDEX IF NOT EXISTS idx_crm_sessions_expires ON crm_sessions(expires_at);
