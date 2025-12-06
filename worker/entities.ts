/**
 * D1-backed Entity Classes for AppChahiye
 * Replaces Durable Objects storage with D1 (SQLite)
 */
import type { WebsiteContent, User, Client, Project, Milestone, Invoice, Message, FormSubmission, Service } from "@shared/types";
import type { Env } from './core-utils';
import { queryAll, queryFirst, insert, updateById, deleteById, existsById, getAll } from './d1-utils';

// ============================================
// Database Row Types (snake_case from SQL)
// ============================================
interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  avatar_url: string | null;
  notification_prefs: string | null;
}

interface ClientRow {
  id: string;
  user_id: string;
  company: string;
  project_type: string | null;
  portal_url: string | null;
  status: string;
  created_at: number;
}

interface ProjectRow {
  id: string;
  client_id: string;
  title: string;
  progress: number;
  deadline: number | null;
  notes: string | null;
  updated_at: number;
}

interface MilestoneRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: number | null;
  files: string | null;
  updated_at: number;
}

interface InvoiceRow {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  pdf_url: string | null;
  issued_at: number;
  service_ids: string | null;
}

interface MessageRow {
  id: string;
  client_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachments: string | null;
  created_at: number;
}

interface FormSubmissionRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project_description: string | null;
  features: string | null;
  submitted_at: number;
}

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
}

interface WebsiteContentRow {
  id: string;
  content: string;
}

// ============================================
// Row-to-Model Converters
// ============================================
const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role as User['role'],
  passwordHash: row.password_hash,
  avatarUrl: row.avatar_url ?? undefined,
  notificationPreferences: row.notification_prefs ? JSON.parse(row.notification_prefs) : { projectUpdates: true, newMessages: true },
});

const toClient = (row: ClientRow): Client => ({
  id: row.id,
  userId: row.user_id,
  company: row.company,
  projectType: row.project_type ?? '',
  portalUrl: row.portal_url ?? '/portal/:clientId',
  status: row.status as Client['status'],
  createdAt: row.created_at,
});

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  clientId: row.client_id,
  title: row.title,
  progress: row.progress,
  deadline: row.deadline,
  notes: row.notes ?? '',
  updatedAt: row.updated_at,
});

const toMilestone = (row: MilestoneRow): Milestone => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  description: row.description ?? '',
  status: row.status as Milestone['status'],
  dueDate: row.due_date,
  files: row.files ? JSON.parse(row.files) : [],
  updatedAt: row.updated_at,
});

const toInvoice = (row: InvoiceRow): Invoice => ({
  id: row.id,
  clientId: row.client_id,
  amount: row.amount,
  status: row.status as Invoice['status'],
  pdf_url: row.pdf_url ?? '',
  issuedAt: row.issued_at,
  serviceIds: row.service_ids ? JSON.parse(row.service_ids) : [],
});

const toMessage = (row: MessageRow): Message => ({
  id: row.id,
  clientId: row.client_id,
  senderId: row.sender_id,
  receiverId: row.receiver_id,
  content: row.content,
  attachments: row.attachments ? JSON.parse(row.attachments) : [],
  createdAt: row.created_at,
});

const toFormSubmission = (row: FormSubmissionRow): FormSubmission => ({
  id: row.id,
  name: row.name,
  email: row.email,
  company: row.company ?? '',
  projectDescription: row.project_description ?? '',
  features: row.features ?? '',
  submittedAt: row.submitted_at,
});

const toService = (row: ServiceRow): Service => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  type: row.type as Service['type'],
  price: row.price,
});

// ============================================
// Mock Website Content (for seeding)
// ============================================
const MOCK_WEBSITE_CONTENT: WebsiteContent = {
  hero: { headline: "Your Business, Simplified.", subheadline: "We build smart web apps that help your business run smoother, faster, and smarter.", imageUrl: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
  howItWorks: [
    { title: "Tell us your needs", description: "Describe your business process and what you want to achieve." },
    { title: "We design & build", description: "Our experts craft a custom web application tailored for you." },
    { title: "Launch & manage", description: "Go live and easily manage your operations from anywhere." }
  ],
  whyChooseUs: [
    { title: "Custom-built workflows", description: "Apps designed around your unique business processes." },
    { title: "Cloud-based & secure", description: "Access your app from anywhere with top-tier security." },
    { title: "Scales with you", description: "Our solutions grow as your business grows." },
    { title: "No tech skills needed", description: "We handle all the technical details, so you don't have to." }
  ],
  portfolio: [
    { name: "CRM Dashboard", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Project Manager", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
    { name: "Inventory System", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Client Portal", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" }
  ],
  pricing: [
    { name: "Starter", price: "PKR 999", features: ["1 Core Workflow", "Up to 5 Users", "Basic Support"], popular: false },
    { name: "Growth", price: "PKR 2499", features: ["Up to 3 Workflows", "Up to 20 Users", "Priority Support", "Integrations"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited Workflows", "Unlimited Users", "Dedicated Support", "Advanced Security"], popular: false }
  ],
  testimonials: [
    { name: "Sarah L.", company: "CEO, Innovate Inc.", text: "AppChahiye transformed our operations. What used to take hours now takes minutes. A true game-changer!", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Mike R.", company: "Founder, Growth Co.", text: "The custom app they built for us is intuitive, fast, and perfectly tailored to our workflow. Highly recommended.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" }
  ],
  finalCta: {
    headline: "Ready to simplify your business?",
    subheadline: "Let's build the perfect web app to streamline your operations and fuel your growth."
  },
  brandAssets: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2F80ED",
    secondaryColor: "#5B2EFF"
  },
  seoMetadata: {
    siteTitle: "AppChahiye: Smart Web Apps for Smarter Businesses",
    metaDescription: "We build custom web apps that make business operations simpler, faster, and smarter."
  }
};

// ============================================
// Entity Classes with D1 Backend
// ============================================

/** User Entity - Manages admin and client users */
export class UserEntity {
  static readonly tableName = "users";

  static async create(env: Env, user: User): Promise<User> {
    await env.DB.prepare(`
      INSERT INTO users (id, email, name, role, password_hash, avatar_url, notification_prefs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.email,
      user.name,
      user.role,
      user.passwordHash,
      user.avatarUrl ?? null,
      user.notificationPreferences ? JSON.stringify(user.notificationPreferences) : null
    ).run();
    return user;
  }

  static async list(env: Env): Promise<{ items: User[]; next: null }> {
    const rows = await queryAll<UserRow>(env.DB, 'SELECT * FROM users');
    return { items: rows.map(toUser), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'users', id);
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'users', this.id);
  }

  async getState(): Promise<User> {
    const row = await queryFirst<UserRow>(this.env.DB, 'SELECT * FROM users WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', email: '', name: '', role: 'client', passwordHash: '' };
    }
    return toUser(row);
  }

  async patch(updates: Partial<User>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.passwordHash !== undefined) dbUpdates.password_hash = updates.passwordHash;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.notificationPreferences !== undefined) {
      dbUpdates.notification_prefs = JSON.stringify(updates.notificationPreferences);
    }
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'users', this.id, dbUpdates);
    }
  }
}

/** Client Entity - Business profile linked to a user */
export class ClientEntity {
  static readonly tableName = "clients";

  static async create(env: Env, client: Client): Promise<Client> {
    await env.DB.prepare(`
      INSERT INTO clients (id, user_id, company, project_type, portal_url, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      client.id,
      client.userId,
      client.company,
      client.projectType,
      client.portalUrl,
      client.status,
      client.createdAt
    ).run();
    return client;
  }

  static async list(env: Env): Promise<{ items: Client[]; next: null }> {
    const rows = await queryAll<ClientRow>(env.DB, 'SELECT * FROM clients');
    return { items: rows.map(toClient), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'clients', id);
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'clients', this.id);
  }

  async getState(): Promise<Client> {
    const row = await queryFirst<ClientRow>(this.env.DB, 'SELECT * FROM clients WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', userId: '', company: '', projectType: '', portalUrl: '', status: 'pending', createdAt: 0 };
    }
    return toClient(row);
  }

  async patch(updates: Partial<Client>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.projectType !== undefined) dbUpdates.project_type = updates.projectType;
    if (updates.portalUrl !== undefined) dbUpdates.portal_url = updates.portalUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'clients', this.id, dbUpdates);
    }
  }
}

/** Project Entity */
export class ProjectEntity {
  static readonly tableName = "projects";

  static async create(env: Env, project: Project): Promise<Project> {
    await env.DB.prepare(`
      INSERT INTO projects (id, client_id, title, progress, deadline, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      project.id,
      project.clientId,
      project.title,
      project.progress,
      project.deadline,
      project.notes,
      project.updatedAt
    ).run();
    return project;
  }

  static async list(env: Env): Promise<{ items: Project[]; next: null }> {
    const rows = await queryAll<ProjectRow>(env.DB, 'SELECT * FROM projects');
    return { items: rows.map(toProject), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'projects', id);
  }

  static async deleteMany(env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, 'projects', id)) count++;
    }
    return count;
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'projects', this.id);
  }

  async getState(): Promise<Project> {
    const row = await queryFirst<ProjectRow>(this.env.DB, 'SELECT * FROM projects WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', clientId: '', title: '', progress: 0, deadline: null, notes: '', updatedAt: 0 };
    }
    return toProject(row);
  }

  async patch(updates: Partial<Project>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'projects', this.id, dbUpdates);
    }
  }
}

/** Milestone Entity */
export class MilestoneEntity {
  static readonly tableName = "milestones";

  static async create(env: Env, milestone: Milestone): Promise<Milestone> {
    await env.DB.prepare(`
      INSERT INTO milestones (id, project_id, title, description, status, due_date, files, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      milestone.id,
      milestone.projectId,
      milestone.title,
      milestone.description,
      milestone.status,
      milestone.dueDate,
      JSON.stringify(milestone.files),
      milestone.updatedAt
    ).run();
    return milestone;
  }

  static async list(env: Env): Promise<{ items: Milestone[]; next: null }> {
    const rows = await queryAll<MilestoneRow>(env.DB, 'SELECT * FROM milestones');
    return { items: rows.map(toMilestone), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'milestones', id);
  }

  static async deleteMany(env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, 'milestones', id)) count++;
    }
    return count;
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'milestones', this.id);
  }

  async getState(): Promise<Milestone> {
    const row = await queryFirst<MilestoneRow>(this.env.DB, 'SELECT * FROM milestones WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', projectId: '', title: '', description: '', status: 'todo', dueDate: null, files: [], updatedAt: 0 };
    }
    return toMilestone(row);
  }

  async patch(updates: Partial<Milestone>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.files !== undefined) dbUpdates.files = JSON.stringify(updates.files);
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'milestones', this.id, dbUpdates);
    }
  }
}

/** Invoice Entity */
export class InvoiceEntity {
  static readonly tableName = "invoices";

  static async create(env: Env, invoice: Invoice): Promise<Invoice> {
    await env.DB.prepare(`
      INSERT INTO invoices (id, client_id, amount, status, pdf_url, issued_at, service_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoice.id,
      invoice.clientId,
      invoice.amount,
      invoice.status,
      invoice.pdf_url,
      invoice.issuedAt,
      invoice.serviceIds ? JSON.stringify(invoice.serviceIds) : '[]'
    ).run();
    return invoice;
  }

  static async list(env: Env): Promise<{ items: Invoice[]; next: null }> {
    const rows = await queryAll<InvoiceRow>(env.DB, 'SELECT * FROM invoices');
    return { items: rows.map(toInvoice), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'invoices', id);
  }

  static async deleteMany(env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, 'invoices', id)) count++;
    }
    return count;
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'invoices', this.id);
  }

  async getState(): Promise<Invoice> {
    const row = await queryFirst<InvoiceRow>(this.env.DB, 'SELECT * FROM invoices WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', clientId: '', amount: 0, status: 'pending', pdf_url: '', issuedAt: 0 };
    }
    return toInvoice(row);
  }

  async patch(updates: Partial<Invoice>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.pdf_url !== undefined) dbUpdates.pdf_url = updates.pdf_url;
    if (updates.serviceIds !== undefined) dbUpdates.service_ids = JSON.stringify(updates.serviceIds);
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'invoices', this.id, dbUpdates);
    }
  }
}

/** Message Entity */
export class MessageEntity {
  static readonly tableName = "messages";

  static async create(env: Env, message: Message): Promise<Message> {
    await env.DB.prepare(`
      INSERT INTO messages (id, client_id, sender_id, receiver_id, content, attachments, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      message.id,
      message.clientId,
      message.senderId,
      message.receiverId,
      message.content,
      JSON.stringify(message.attachments),
      message.createdAt
    ).run();
    return message;
  }

  static async list(env: Env): Promise<{ items: Message[]; next: null }> {
    const rows = await queryAll<MessageRow>(env.DB, 'SELECT * FROM messages ORDER BY created_at ASC');
    return { items: rows.map(toMessage), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'messages', id);
  }

  static async deleteMany(env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, 'messages', id)) count++;
    }
    return count;
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'messages', this.id);
  }

  async getState(): Promise<Message> {
    const row = await queryFirst<MessageRow>(this.env.DB, 'SELECT * FROM messages WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', clientId: '', senderId: '', receiverId: '', content: '', attachments: [], createdAt: 0 };
    }
    return toMessage(row);
  }
}

/** Form Submission Entity */
export class FormSubmissionEntity {
  static readonly tableName = "form_submissions";

  static async create(env: Env, submission: FormSubmission): Promise<FormSubmission> {
    await env.DB.prepare(`
      INSERT INTO form_submissions (id, name, email, company, project_description, features, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submission.id,
      submission.name,
      submission.email,
      submission.company,
      submission.projectDescription,
      submission.features,
      submission.submittedAt
    ).run();
    return submission;
  }

  static async list(env: Env): Promise<{ items: FormSubmission[]; next: null }> {
    const rows = await queryAll<FormSubmissionRow>(env.DB, 'SELECT * FROM form_submissions ORDER BY submitted_at DESC');
    return { items: rows.map(toFormSubmission), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'form_submissions', id);
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'form_submissions', this.id);
  }

  async getState(): Promise<FormSubmission> {
    const row = await queryFirst<FormSubmissionRow>(this.env.DB, 'SELECT * FROM form_submissions WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', name: '', email: '', company: '', projectDescription: '', features: '', submittedAt: 0 };
    }
    return toFormSubmission(row);
  }
}

/** Service Entity */
export class ServiceEntity {
  static readonly tableName = "services";

  static async create(env: Env, service: Service): Promise<Service> {
    await env.DB.prepare(`
      INSERT INTO services (id, name, description, type, price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      service.id,
      service.name,
      service.description,
      service.type,
      service.price
    ).run();
    return service;
  }

  static async list(env: Env): Promise<{ items: Service[]; next: null }> {
    const rows = await queryAll<ServiceRow>(env.DB, 'SELECT * FROM services');
    return { items: rows.map(toService), next: null };
  }

  static async delete(env: Env, id: string): Promise<boolean> {
    return await deleteById(env.DB, 'services', id);
  }

  constructor(private env: Env, private id: string) { }

  async exists(): Promise<boolean> {
    return await existsById(this.env.DB, 'services', this.id);
  }

  async getState(): Promise<Service> {
    const row = await queryFirst<ServiceRow>(this.env.DB, 'SELECT * FROM services WHERE id = ?', [this.id]);
    if (!row) {
      return { id: '', name: '', description: '', type: 'one-time', price: 0 };
    }
    return toService(row);
  }

  async patch(updates: Partial<Service>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, 'services', this.id, dbUpdates);
    }
  }
}

/** Website Content Entity (singleton) */
export class WebsiteContentEntity {
  static readonly tableName = "website_content";
  static readonly singletonId = "singleton";

  static async ensureExists(env: Env): Promise<WebsiteContentEntity> {
    const row = await queryFirst<WebsiteContentRow>(env.DB, 'SELECT * FROM website_content WHERE id = ?', [this.singletonId]);
    if (!row) {
      // Seed with mock content
      await env.DB.prepare(`
        INSERT INTO website_content (id, content) VALUES (?, ?)
      `).bind(this.singletonId, JSON.stringify(MOCK_WEBSITE_CONTENT)).run();
    }
    return new WebsiteContentEntity(env, this.singletonId);
  }

  constructor(private env: Env, private id: string) { }

  async getState(): Promise<WebsiteContent> {
    const row = await queryFirst<WebsiteContentRow>(this.env.DB, 'SELECT * FROM website_content WHERE id = ?', [this.id]);
    if (!row) return MOCK_WEBSITE_CONTENT;
    return JSON.parse(row.content);
  }

  async save(content: WebsiteContent): Promise<void> {
    await this.env.DB.prepare(`
      UPDATE website_content SET content = ? WHERE id = ?
    `).bind(JSON.stringify(content), this.id).run();
  }
}