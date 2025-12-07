/**
 * AppChahiye CRM Pillars
 * 
 * Defines the 10 universal pillars that power any CRM.
 * Each pillar contains modules with default fields.
 */

import type { PillarDefinition, Pillar, ModuleDefinition, FieldDefinition } from '@shared/saas-types';

// ============================================
// Universal Pillar Definitions
// ============================================

export const PILLARS: PillarDefinition[] = [
    {
        id: 'people',
        name: 'People',
        description: 'Manage contacts, leads, and companies',
        icon: 'users',
        color: '#6366f1',
        defaultModules: [
            {
                systemName: 'contacts',
                displayName: 'Contacts',
                description: 'Individual people you work with',
                icon: 'user',
                defaultFields: [
                    { name: 'name', label: 'Name', type: 'text', required: true, showInList: true },
                    { name: 'email', label: 'Email', type: 'email', showInList: true },
                    { name: 'phone', label: 'Phone', type: 'phone', showInList: true },
                    { name: 'company', label: 'Company', type: 'text', showInList: true },
                    { name: 'title', label: 'Title', type: 'text' },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                    {
                        name: 'status', label: 'Status', type: 'select', options: {
                            choices: [
                                { value: 'active', label: 'Active', color: '#22c55e' },
                                { value: 'inactive', label: 'Inactive', color: '#ef4444' },
                            ]
                        }
                    },
                ],
            },
            {
                systemName: 'leads',
                displayName: 'Leads',
                description: 'Potential customers to follow up',
                icon: 'target',
                defaultFields: [
                    { name: 'name', label: 'Name', type: 'text', required: true, showInList: true },
                    { name: 'email', label: 'Email', type: 'email', showInList: true },
                    { name: 'phone', label: 'Phone', type: 'phone' },
                    {
                        name: 'source', label: 'Source', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'website', label: 'Website' },
                                { value: 'referral', label: 'Referral' },
                                { value: 'social', label: 'Social Media' },
                                { value: 'ads', label: 'Advertising' },
                                { value: 'other', label: 'Other' },
                            ]
                        }
                    },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'new', label: 'New', color: '#3b82f6' },
                                { value: 'contacted', label: 'Contacted', color: '#f59e0b' },
                                { value: 'qualified', label: 'Qualified', color: '#8b5cf6' },
                                { value: 'converted', label: 'Converted', color: '#22c55e' },
                                { value: 'lost', label: 'Lost', color: '#ef4444' },
                            ]
                        }
                    },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
            {
                systemName: 'companies',
                displayName: 'Companies',
                description: 'Organizations you work with',
                icon: 'building',
                defaultFields: [
                    { name: 'name', label: 'Company Name', type: 'text', required: true, showInList: true },
                    { name: 'website', label: 'Website', type: 'url' },
                    { name: 'industry', label: 'Industry', type: 'text', showInList: true },
                    { name: 'phone', label: 'Phone', type: 'phone' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'address', label: 'Address', type: 'textarea' },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
        ],
    },
    {
        id: 'work',
        name: 'Work',
        description: 'Track tasks, projects, and deals',
        icon: 'briefcase',
        color: '#8b5cf6',
        defaultModules: [
            {
                systemName: 'tasks',
                displayName: 'Tasks',
                description: 'Action items to complete',
                icon: 'check-square',
                defaultFields: [
                    { name: 'title', label: 'Title', type: 'text', required: true, showInList: true },
                    { name: 'description', label: 'Description', type: 'textarea' },
                    { name: 'due_date', label: 'Due Date', type: 'date', showInList: true },
                    {
                        name: 'priority', label: 'Priority', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'low', label: 'Low', color: '#94a3b8' },
                                { value: 'medium', label: 'Medium', color: '#f59e0b' },
                                { value: 'high', label: 'High', color: '#ef4444' },
                            ]
                        }
                    },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'todo', label: 'To Do', color: '#94a3b8' },
                                { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                                { value: 'done', label: 'Done', color: '#22c55e' },
                            ]
                        }
                    },
                ],
            },
            {
                systemName: 'projects',
                displayName: 'Projects',
                description: 'Larger initiatives with multiple tasks',
                icon: 'folder',
                defaultFields: [
                    { name: 'name', label: 'Project Name', type: 'text', required: true, showInList: true },
                    { name: 'description', label: 'Description', type: 'textarea' },
                    { name: 'start_date', label: 'Start Date', type: 'date' },
                    { name: 'end_date', label: 'End Date', type: 'date', showInList: true },
                    { name: 'budget', label: 'Budget', type: 'currency' },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'planning', label: 'Planning', color: '#94a3b8' },
                                { value: 'active', label: 'Active', color: '#3b82f6' },
                                { value: 'on_hold', label: 'On Hold', color: '#f59e0b' },
                                { value: 'completed', label: 'Completed', color: '#22c55e' },
                                { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
                            ]
                        }
                    },
                ],
            },
            {
                systemName: 'deals',
                displayName: 'Deals',
                description: 'Sales opportunities to track',
                icon: 'dollar-sign',
                defaultFields: [
                    { name: 'name', label: 'Deal Name', type: 'text', required: true, showInList: true },
                    { name: 'value', label: 'Value', type: 'currency', showInList: true },
                    { name: 'probability', label: 'Probability %', type: 'number', options: { min: 0, max: 100 } },
                    { name: 'expected_close', label: 'Expected Close', type: 'date', showInList: true },
                    {
                        name: 'stage', label: 'Stage', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'discovery', label: 'Discovery', color: '#94a3b8' },
                                { value: 'proposal', label: 'Proposal', color: '#3b82f6' },
                                { value: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
                                { value: 'won', label: 'Won', color: '#22c55e' },
                                { value: 'lost', label: 'Lost', color: '#ef4444' },
                            ]
                        }
                    },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
        ],
    },
    {
        id: 'money',
        name: 'Money',
        description: 'Track invoices, payments, and expenses',
        icon: 'credit-card',
        color: '#22c55e',
        defaultModules: [
            {
                systemName: 'invoices',
                displayName: 'Invoices',
                description: 'Bills to send to clients',
                icon: 'file-text',
                defaultFields: [
                    { name: 'invoice_number', label: 'Invoice #', type: 'text', required: true, showInList: true },
                    { name: 'client_name', label: 'Client', type: 'text', required: true, showInList: true },
                    { name: 'amount', label: 'Amount', type: 'currency', required: true, showInList: true },
                    { name: 'issue_date', label: 'Issue Date', type: 'date', showInList: true },
                    { name: 'due_date', label: 'Due Date', type: 'date', showInList: true },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'draft', label: 'Draft', color: '#94a3b8' },
                                { value: 'sent', label: 'Sent', color: '#3b82f6' },
                                { value: 'paid', label: 'Paid', color: '#22c55e' },
                                { value: 'overdue', label: 'Overdue', color: '#ef4444' },
                            ]
                        }
                    },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
            {
                systemName: 'payments',
                displayName: 'Payments',
                description: 'Payments received',
                icon: 'dollar-sign',
                defaultFields: [
                    { name: 'description', label: 'Description', type: 'text', required: true, showInList: true },
                    { name: 'amount', label: 'Amount', type: 'currency', required: true, showInList: true },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                    {
                        name: 'method', label: 'Payment Method', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'cash', label: 'Cash' },
                                { value: 'card', label: 'Card' },
                                { value: 'bank', label: 'Bank Transfer' },
                                { value: 'other', label: 'Other' },
                            ]
                        }
                    },
                ],
            },
            {
                systemName: 'expenses',
                displayName: 'Expenses',
                description: 'Track business expenses',
                icon: 'trending-down',
                defaultFields: [
                    { name: 'description', label: 'Description', type: 'text', required: true, showInList: true },
                    { name: 'amount', label: 'Amount', type: 'currency', required: true, showInList: true },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                    {
                        name: 'category', label: 'Category', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'supplies', label: 'Supplies' },
                                { value: 'travel', label: 'Travel' },
                                { value: 'utilities', label: 'Utilities' },
                                { value: 'equipment', label: 'Equipment' },
                                { value: 'other', label: 'Other' },
                            ]
                        }
                    },
                    { name: 'receipt', label: 'Receipt', type: 'file' },
                ],
            },
        ],
    },
    {
        id: 'stock',
        name: 'Stock',
        description: 'Manage products and inventory',
        icon: 'package',
        color: '#f59e0b',
        defaultModules: [
            {
                systemName: 'products',
                displayName: 'Products',
                description: 'Items you sell',
                icon: 'box',
                defaultFields: [
                    { name: 'name', label: 'Product Name', type: 'text', required: true, showInList: true },
                    { name: 'sku', label: 'SKU', type: 'text', showInList: true },
                    { name: 'price', label: 'Price', type: 'currency', required: true, showInList: true },
                    { name: 'cost', label: 'Cost', type: 'currency' },
                    { name: 'quantity', label: 'Quantity', type: 'number', showInList: true },
                    { name: 'category', label: 'Category', type: 'text', showInList: true },
                    { name: 'description', label: 'Description', type: 'textarea' },
                    { name: 'image', label: 'Image', type: 'image' },
                ],
            },
            {
                systemName: 'inventory',
                displayName: 'Inventory',
                description: 'Stock levels and movements',
                icon: 'layers',
                defaultFields: [
                    { name: 'product_name', label: 'Product', type: 'text', required: true, showInList: true },
                    {
                        name: 'type', label: 'Type', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'in', label: 'Stock In', color: '#22c55e' },
                                { value: 'out', label: 'Stock Out', color: '#ef4444' },
                                { value: 'adjustment', label: 'Adjustment', color: '#f59e0b' },
                            ]
                        }
                    },
                    { name: 'quantity', label: 'Quantity', type: 'number', required: true, showInList: true },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
            {
                systemName: 'orders',
                displayName: 'Orders',
                description: 'Customer orders',
                icon: 'shopping-cart',
                defaultFields: [
                    { name: 'order_number', label: 'Order #', type: 'text', required: true, showInList: true },
                    { name: 'customer_name', label: 'Customer', type: 'text', required: true, showInList: true },
                    { name: 'total', label: 'Total', type: 'currency', showInList: true },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'pending', label: 'Pending', color: '#f59e0b' },
                                { value: 'processing', label: 'Processing', color: '#3b82f6' },
                                { value: 'shipped', label: 'Shipped', color: '#8b5cf6' },
                                { value: 'delivered', label: 'Delivered', color: '#22c55e' },
                                { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
                            ]
                        }
                    },
                ],
            },
        ],
    },
    {
        id: 'time',
        name: 'Time',
        description: 'Schedule appointments and track time',
        icon: 'clock',
        color: '#ec4899',
        defaultModules: [
            {
                systemName: 'appointments',
                displayName: 'Appointments',
                description: 'Scheduled meetings and events',
                icon: 'calendar',
                defaultFields: [
                    { name: 'title', label: 'Title', type: 'text', required: true, showInList: true },
                    { name: 'date', label: 'Date', type: 'date', required: true, showInList: true },
                    { name: 'time', label: 'Time', type: 'text', showInList: true },
                    { name: 'duration', label: 'Duration (min)', type: 'number' },
                    { name: 'location', label: 'Location', type: 'text' },
                    { name: 'attendee', label: 'Attendee', type: 'text', showInList: true },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                    {
                        name: 'status', label: 'Status', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'scheduled', label: 'Scheduled', color: '#3b82f6' },
                                { value: 'completed', label: 'Completed', color: '#22c55e' },
                                { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
                                { value: 'no_show', label: 'No Show', color: '#f59e0b' },
                            ]
                        }
                    },
                ],
            },
            {
                systemName: 'timesheet',
                displayName: 'Timesheet',
                description: 'Track time worked',
                icon: 'clock',
                defaultFields: [
                    { name: 'description', label: 'Description', type: 'text', required: true, showInList: true },
                    { name: 'date', label: 'Date', type: 'date', required: true, showInList: true },
                    { name: 'hours', label: 'Hours', type: 'number', required: true, showInList: true },
                    { name: 'project', label: 'Project', type: 'text', showInList: true },
                    { name: 'billable', label: 'Billable', type: 'checkbox' },
                ],
            },
        ],
    },
    {
        id: 'places',
        name: 'Places',
        description: 'Manage locations and addresses',
        icon: 'map-pin',
        color: '#06b6d4',
        defaultModules: [
            {
                systemName: 'locations',
                displayName: 'Locations',
                description: 'Physical locations',
                icon: 'map-pin',
                defaultFields: [
                    { name: 'name', label: 'Location Name', type: 'text', required: true, showInList: true },
                    {
                        name: 'type', label: 'Type', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'office', label: 'Office' },
                                { value: 'warehouse', label: 'Warehouse' },
                                { value: 'store', label: 'Store' },
                                { value: 'other', label: 'Other' },
                            ]
                        }
                    },
                    { name: 'address', label: 'Address', type: 'textarea', showInList: true },
                    { name: 'phone', label: 'Phone', type: 'phone' },
                    { name: 'notes', label: 'Notes', type: 'textarea' },
                ],
            },
        ],
    },
    {
        id: 'files',
        name: 'Files',
        description: 'Store and organize documents',
        icon: 'file',
        color: '#64748b',
        defaultModules: [
            {
                systemName: 'documents',
                displayName: 'Documents',
                description: 'Important files and documents',
                icon: 'file-text',
                defaultFields: [
                    { name: 'name', label: 'Document Name', type: 'text', required: true, showInList: true },
                    {
                        name: 'type', label: 'Type', type: 'select', showInList: true, options: {
                            choices: [
                                { value: 'contract', label: 'Contract' },
                                { value: 'proposal', label: 'Proposal' },
                                { value: 'report', label: 'Report' },
                                { value: 'invoice', label: 'Invoice' },
                                { value: 'other', label: 'Other' },
                            ]
                        }
                    },
                    { name: 'file', label: 'File', type: 'file', required: true },
                    { name: 'description', label: 'Description', type: 'textarea' },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                ],
            },
        ],
    },
    {
        id: 'talk',
        name: 'Talk',
        description: 'Communication and messaging',
        icon: 'message-circle',
        color: '#a855f7',
        defaultModules: [
            {
                systemName: 'notes',
                displayName: 'Notes',
                description: 'Quick notes and memos',
                icon: 'file-text',
                defaultFields: [
                    { name: 'title', label: 'Title', type: 'text', required: true, showInList: true },
                    { name: 'content', label: 'Content', type: 'textarea', required: true },
                    { name: 'date', label: 'Date', type: 'date', showInList: true },
                    { name: 'tags', label: 'Tags', type: 'text', showInList: true },
                ],
            },
        ],
    },
    {
        id: 'reports',
        name: 'Reports',
        description: 'Analytics and insights',
        icon: 'bar-chart-2',
        color: '#0ea5e9',
        defaultModules: [], // Reports are generated, not record-based
    },
    {
        id: 'settings',
        name: 'Settings',
        description: 'CRM configuration',
        icon: 'settings',
        color: '#78716c',
        defaultModules: [], // Settings are handled separately
    },
];

// ============================================
// Helper Functions
// ============================================

export function getPillarById(pillarId: Pillar): PillarDefinition | undefined {
    return PILLARS.find(p => p.id === pillarId);
}

export function getModulesByPillar(pillarId: Pillar): ModuleDefinition[] {
    const pillar = getPillarById(pillarId);
    return pillar?.defaultModules || [];
}

export function getAllModuleDefinitions(): { pillar: Pillar; module: ModuleDefinition }[] {
    const result: { pillar: Pillar; module: ModuleDefinition }[] = [];
    for (const pillar of PILLARS) {
        for (const module of pillar.defaultModules) {
            result.push({ pillar: pillar.id, module });
        }
    }
    return result;
}

export function getDefaultPillars(): Pillar[] {
    return ['people', 'work', 'money'];
}

export function getPillarColor(pillarId: Pillar): string {
    return getPillarById(pillarId)?.color || '#6366f1';
}

export function getPillarIcon(pillarId: Pillar): string {
    return getPillarById(pillarId)?.icon || 'folder';
}
