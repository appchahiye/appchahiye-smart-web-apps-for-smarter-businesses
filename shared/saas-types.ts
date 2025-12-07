// ============================================
// AppChahiye SaaS Types
// Multi-Tenant CRM Platform
// ============================================

// ------------------------------------------------
// Plan Types
// ------------------------------------------------

export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export const PLAN_LIMITS: Record<TenantPlan, { maxApps: number; maxRecordsPerApp: number; maxCrmUsers: number }> = {
    free: { maxApps: 1, maxRecordsPerApp: 100, maxCrmUsers: 2 },
    starter: { maxApps: 3, maxRecordsPerApp: 1000, maxCrmUsers: 5 },
    pro: { maxApps: 10, maxRecordsPerApp: 10000, maxCrmUsers: 25 },
    enterprise: { maxApps: -1, maxRecordsPerApp: -1, maxCrmUsers: -1 }, // Unlimited
};

// ------------------------------------------------
// Tenant Types
// ------------------------------------------------

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    plan: TenantPlan;
    branding: TenantBranding;
    settings: TenantSettings;
    createdAt: number;
    updatedAt: number;
}

export interface TenantBranding {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface TenantSettings {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    language?: string;
}

// ------------------------------------------------
// CRM App Types
// ------------------------------------------------

export interface CrmApp {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    businessType: BusinessType;
    config: CrmAppConfig;
    enabledPillars: Pillar[];
    branding: CrmAppBranding;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export type BusinessType =
    | 'retail'
    | 'services'
    | 'clinic'
    | 'education'
    | 'realestate'
    | 'hospitality'
    | 'custom';

export interface CrmAppConfig {
    defaultModule?: string;
    features?: string[];
    moduleRenames?: Record<string, string>;
}

export interface CrmAppBranding {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    favicon?: string;
}

// ------------------------------------------------
// Pillar Types (The 10 Universal Pillars)
// ------------------------------------------------

export type Pillar =
    | 'people'
    | 'work'
    | 'money'
    | 'stock'
    | 'time'
    | 'places'
    | 'files'
    | 'talk'
    | 'reports'
    | 'settings';

export interface PillarDefinition {
    id: Pillar;
    name: string;
    description: string;
    icon: string;
    color: string;
    defaultModules: ModuleDefinition[];
}

export interface ModuleDefinition {
    systemName: string;
    displayName: string;
    description: string;
    icon: string;
    defaultFields: FieldDefinition[];
}

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    options?: FieldOptions;
    showInList?: boolean;
}

// ------------------------------------------------
// CRM User Types (Separate from AppChahiye Users)
// ------------------------------------------------

export interface CrmUser {
    id: string;
    appId: string;
    email: string;
    name: string;
    role: CrmUserRole;
    avatarUrl?: string;
    permissions: CrmPermissions;
    isActive: boolean;
    lastLoginAt?: number;
    createdAt: number;
    updatedAt: number;
}

export type CrmUserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface CrmPermissions {
    canCreateRecords?: boolean;
    canEditRecords?: boolean;
    canDeleteRecords?: boolean;
    canManageUsers?: boolean;
    canManageSettings?: boolean;
    moduleAccess?: Record<string, 'full' | 'read' | 'none'>;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<CrmUserRole, CrmPermissions> = {
    owner: {
        canCreateRecords: true,
        canEditRecords: true,
        canDeleteRecords: true,
        canManageUsers: true,
        canManageSettings: true,
    },
    admin: {
        canCreateRecords: true,
        canEditRecords: true,
        canDeleteRecords: true,
        canManageUsers: true,
        canManageSettings: false,
    },
    member: {
        canCreateRecords: true,
        canEditRecords: true,
        canDeleteRecords: false,
        canManageUsers: false,
        canManageSettings: false,
    },
    viewer: {
        canCreateRecords: false,
        canEditRecords: false,
        canDeleteRecords: false,
        canManageUsers: false,
        canManageSettings: false,
    },
};

// ------------------------------------------------
// Module Types
// ------------------------------------------------

export interface Module {
    id: string;
    appId: string;
    pillar: Pillar;
    systemName: string;
    displayName: string;
    description: string;
    icon: string;
    color: string;
    enabled: boolean;
    sortOrder: number;
    config: ModuleConfig;
    createdAt: number;
}

export interface ModuleConfig {
    allowCreate?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowExport?: boolean;
    defaultView?: string;
    recordNameField?: string;
}

// ------------------------------------------------
// Field Types
// ------------------------------------------------

export interface Field {
    id: string;
    moduleId: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    unique: boolean;
    defaultValue?: string;
    placeholder?: string;
    options: FieldOptions;
    validation: FieldValidation;
    sortOrder: number;
    showInList: boolean;
    showInForm: boolean;
    isSystem: boolean;
    createdAt: number;
}

export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'phone'
    | 'url'
    | 'date'
    | 'datetime'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'file'
    | 'image'
    | 'relation'
    | 'currency'
    | 'rating'
    | 'color';

export interface FieldOptions {
    choices?: { value: string; label: string; color?: string }[];
    relationModuleId?: string;
    relationDisplayField?: string;
    min?: number;
    max?: number;
    step?: number;
    currency?: string;
    prefix?: string;
    suffix?: string;
    acceptedTypes?: string[];
    maxSize?: number;
}

export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
}

// ------------------------------------------------
// Record Types
// ------------------------------------------------

export interface Record {
    id: string;
    appId: string;
    moduleId: string;
    data: RecordData;
    createdBy?: string;
    updatedBy?: string;
    createdAt: number;
    updatedAt: number;
}

export type RecordData = {
    [fieldName: string]: unknown;
};

// ------------------------------------------------
// View Types
// ------------------------------------------------

export interface View {
    id: string;
    moduleId: string;
    name: string;
    type: ViewType;
    config: ViewConfig;
    filters: ViewFilter[];
    sort: ViewSort[];
    columns: string[];
    grouping?: string;
    isDefault: boolean;
    isShared: boolean;
    createdBy?: string;
    createdAt: number;
    updatedAt: number;
}

export type ViewType = 'table' | 'kanban' | 'calendar' | 'list' | 'board' | 'gallery';

export interface ViewConfig {
    kanbanField?: string;
    calendarDateField?: string;
    calendarEndField?: string;
    groupBy?: string;
    pageSize?: number;
    cardFields?: string[];
    galleryImageField?: string;
}

export interface ViewFilter {
    field: string;
    operator: FilterOperator;
    value: unknown;
}

export type FilterOperator =
    | 'eq' | 'neq'
    | 'gt' | 'lt' | 'gte' | 'lte'
    | 'contains' | 'not_contains'
    | 'starts_with' | 'ends_with'
    | 'is_empty' | 'is_not_empty'
    | 'in' | 'not_in';

export interface ViewSort {
    field: string;
    direction: 'asc' | 'desc';
}

// ------------------------------------------------
// Activity Types
// ------------------------------------------------

export interface Activity {
    id: string;
    recordId: string;
    type: ActivityType;
    content: string;
    metadata: ActivityMetadata;
    createdBy?: string;
    createdAt: number;
}

export type ActivityType =
    | 'note'
    | 'comment'
    | 'status_change'
    | 'field_update'
    | 'file_added'
    | 'created'
    | 'deleted'
    | 'restored';

export interface ActivityMetadata {
    fieldName?: string;
    oldValue?: unknown;
    newValue?: unknown;
    fileName?: string;
    fileUrl?: string;
}

// ------------------------------------------------
// Relation Types
// ------------------------------------------------

export interface Relation {
    id: string;
    sourceRecordId: string;
    targetRecordId: string;
    relationType: string;
    metadata: Record<string, unknown>;
    createdAt: number;
}

// ------------------------------------------------
// CRM File Types
// ------------------------------------------------

export interface CrmFile {
    id: string;
    appId: string;
    recordId?: string;
    moduleId?: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    r2Key: string;
    uploadedBy?: string;
    createdAt: number;
}

// ------------------------------------------------
// CRM Session Types
// ------------------------------------------------

export interface CrmSession {
    id: string;
    userId: string;
    token: string;
    expiresAt: number;
    createdAt: number;
}

// ------------------------------------------------
// POS Types (Architecture Only)
// ------------------------------------------------

export interface PosTransaction {
    id: string;
    appId: string;
    type: 'sale' | 'refund' | 'void';
    status: 'pending' | 'completed' | 'cancelled';
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod?: string;
    customerRecordId?: string;
    lineItems: PosLineItem[];
    metadata: Record<string, unknown>;
    createdBy?: string;
    createdAt: number;
    completedAt?: number;
}

export interface PosLineItem {
    productRecordId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

// ------------------------------------------------
// API Request/Response Types
// ------------------------------------------------

export interface CreateCrmRequest {
    businessType: BusinessType;
    name: string;
    businessName?: string;
    primaryColor?: string;
    logoUrl?: string;
}

export interface CreateCrmResponse {
    app: CrmApp;
    modules: Module[];
}

export interface CrmWizardData {
    businessType: BusinessType;
    businessName: string;
    name: string;
    primaryColor: string;
    logoUrl?: string;
    customPillars?: Pillar[];
}

// ------------------------------------------------
// Dashboard Stats Types
// ------------------------------------------------

export interface TenantDashboardStats {
    totalApps: number;
    totalRecords: number;
    totalCrmUsers: number;
    plan: TenantPlan;
    planLimits: {
        maxApps: number;
        maxRecordsPerApp: number;
        maxCrmUsers: number;
    };
    recentActivity: Activity[];
}

export interface CrmDashboardStats {
    totalRecords: number;
    totalUsers: number;
    moduleStats: { moduleId: string; moduleName: string; recordCount: number }[];
    recentRecords: Record[];
    recentActivity: Activity[];
}
