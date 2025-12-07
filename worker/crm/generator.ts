/**
 * AppChahiye CRM Generator
 * 
 * Creates CRM instances with modules and fields based on
 * user selections and pillar definitions.
 */

import type { Env } from '../core-utils';
import type { CrmApp, Module, Field, View, CrmWizardData, BusinessType, Pillar } from '@shared/saas-types';
import { CrmAppEntity, ModuleEntity, FieldEntity, ViewEntity } from '../saas-entities';
import { PILLARS, getPillarById, getDefaultPillars } from './pillars';

// ============================================
// Business Type Presets
// ============================================

export interface BusinessPreset {
    id: BusinessType;
    name: string;
    description: string;
    icon: string;
    pillars: Pillar[];
    moduleRenames: Record<string, string>;
}

export const BUSINESS_PRESETS: BusinessPreset[] = [
    {
        id: 'retail',
        name: 'Retail / E-commerce',
        description: 'Sell products to customers',
        icon: 'shopping-cart',
        pillars: ['people', 'stock', 'money', 'work'],
        moduleRenames: {
            'contacts': 'Customers',
            'products': 'Inventory',
        },
    },
    {
        id: 'services',
        name: 'Services / Agency',
        description: 'Provide services to clients',
        icon: 'briefcase',
        pillars: ['people', 'work', 'money', 'time'],
        moduleRenames: {
            'contacts': 'Clients',
            'tasks': 'Jobs',
            'projects': 'Cases',
        },
    },
    {
        id: 'clinic',
        name: 'Clinic / Healthcare',
        description: 'Medical practice management',
        icon: 'heart',
        pillars: ['people', 'time', 'money', 'files'],
        moduleRenames: {
            'contacts': 'Patients',
            'appointments': 'Appointments',
            'documents': 'Records',
        },
    },
    {
        id: 'education',
        name: 'Education / Training',
        description: 'Manage students and courses',
        icon: 'book',
        pillars: ['people', 'work', 'time', 'money'],
        moduleRenames: {
            'contacts': 'Students',
            'projects': 'Courses',
            'tasks': 'Assignments',
        },
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        description: 'Property and client management',
        icon: 'home',
        pillars: ['people', 'places', 'money', 'files'],
        moduleRenames: {
            'contacts': 'Clients',
            'locations': 'Properties',
        },
    },
    {
        id: 'hospitality',
        name: 'Hospitality / Restaurant',
        description: 'Hotels, restaurants, cafes',
        icon: 'coffee',
        pillars: ['people', 'stock', 'money', 'time'],
        moduleRenames: {
            'contacts': 'Guests',
            'products': 'Menu Items',
            'orders': 'Reservations',
        },
    },
    {
        id: 'custom',
        name: 'Custom / Other',
        description: 'Build your own CRM',
        icon: 'settings',
        pillars: ['people', 'work', 'money'],
        moduleRenames: {},
    },
];

// ============================================
// CRM Generator Functions
// ============================================

/**
 * Generate a URL-safe slug from a name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}

/**
 * Create a new CRM from wizard data
 */
export async function createCrmFromWizard(
    env: Env,
    tenantId: string,
    wizardData: CrmWizardData
): Promise<{ app: CrmApp; modules: Module[] }> {
    const appId = crypto.randomUUID();
    const slug = generateSlug(wizardData.name);

    // Determine which pillars to enable based on business type
    const preset = BUSINESS_PRESETS.find(p => p.id === wizardData.businessType);
    const enabledPillars: Pillar[] = wizardData.customPillars || preset?.pillars || getDefaultPillars();

    // Create the CRM app
    const app = await CrmAppEntity.create(env, {
        id: appId,
        tenantId,
        name: wizardData.name,
        slug,
        description: `CRM for ${wizardData.businessName || wizardData.name}`,
        icon: preset?.icon || 'briefcase',
        businessType: wizardData.businessType,
        config: {
            moduleRenames: preset?.moduleRenames || {},
        },
        enabledPillars,
        branding: {
            primaryColor: wizardData.primaryColor || '#6366f1',
            logoUrl: wizardData.logoUrl,
        },
        isActive: true,
    });

    // Create modules for each enabled pillar
    const modules: Module[] = [];
    let sortOrder = 0;

    for (const pillarId of enabledPillars) {
        const pillarDef = getPillarById(pillarId);
        if (!pillarDef) continue;

        for (const moduleDef of pillarDef.defaultModules) {
            const moduleId = crypto.randomUUID();

            // Check for custom name from preset
            const displayName = preset?.moduleRenames[moduleDef.systemName] || moduleDef.displayName;

            const module = await ModuleEntity.create(env, {
                id: moduleId,
                appId,
                pillar: pillarId,
                systemName: moduleDef.systemName,
                displayName,
                description: moduleDef.description,
                icon: moduleDef.icon,
                color: pillarDef.color,
                enabled: true,
                sortOrder: sortOrder++,
                config: {
                    allowCreate: true,
                    allowEdit: true,
                    allowDelete: true,
                    allowExport: true,
                },
            });

            modules.push(module);

            // Create fields for this module
            let fieldOrder = 0;
            for (const fieldDef of moduleDef.defaultFields) {
                await FieldEntity.create(env, {
                    id: crypto.randomUUID(),
                    moduleId,
                    name: fieldDef.name,
                    label: fieldDef.label,
                    type: fieldDef.type,
                    required: fieldDef.required || false,
                    unique: false,
                    placeholder: fieldDef.placeholder,
                    options: fieldDef.options || {},
                    validation: {},
                    sortOrder: fieldOrder++,
                    showInList: fieldDef.showInList !== false,
                    showInForm: true,
                    isSystem: false,
                });
            }

            // Create default table view for this module
            await ViewEntity.create(env, {
                id: crypto.randomUUID(),
                moduleId,
                name: 'All ' + displayName,
                type: 'table',
                config: { pageSize: 25 },
                filters: [],
                sort: [{ field: 'created_at', direction: 'desc' }],
                columns: moduleDef.defaultFields
                    .filter(f => f.showInList !== false)
                    .map(f => f.name),
                isDefault: true,
                isShared: true,
            });

            // Create Kanban view if module has status field
            const hasStatusField = moduleDef.defaultFields.some(f => f.name === 'status');
            if (hasStatusField) {
                await ViewEntity.create(env, {
                    id: crypto.randomUUID(),
                    moduleId,
                    name: displayName + ' Board',
                    type: 'kanban',
                    config: { kanbanField: 'status' },
                    filters: [],
                    sort: [],
                    columns: [],
                    isDefault: false,
                    isShared: true,
                });
            }
        }
    }

    return { app, modules };
}

/**
 * Get preview of what will be created for a business type
 */
export function previewCrmStructure(businessType: BusinessType): {
    pillars: { id: Pillar; name: string; color: string; modules: { systemName: string; displayName: string; icon: string }[] }[];
} {
    const preset = BUSINESS_PRESETS.find(p => p.id === businessType);
    const pillarIds = preset?.pillars || getDefaultPillars();

    const pillars = pillarIds.map(pillarId => {
        const pillarDef = getPillarById(pillarId);
        if (!pillarDef) return null;

        return {
            id: pillarId,
            name: pillarDef.name,
            color: pillarDef.color,
            modules: pillarDef.defaultModules.map(m => ({
                systemName: m.systemName,
                displayName: preset?.moduleRenames[m.systemName] || m.displayName,
                icon: m.icon,
            })),
        };
    }).filter(Boolean) as {
        id: Pillar;
        name: string;
        color: string;
        modules: { systemName: string; displayName: string; icon: string }[];
    }[];

    return { pillars };
}

/**
 * Get business preset by ID
 */
export function getBusinessPreset(businessType: BusinessType): BusinessPreset | undefined {
    return BUSINESS_PRESETS.find(p => p.id === businessType);
}

/**
 * Count modules that will be created for a business type
 */
export function countModulesForBusinessType(businessType: BusinessType): number {
    const preview = previewCrmStructure(businessType);
    return preview.pillars.reduce((total, p) => total + p.modules.length, 0);
}
