import { Entity, IndexedEntity } from "./core-utils";
import type { WebsiteContent, User, Client, Project, Milestone, Invoice, Message } from "@shared/types";
import type { Env } from './core-utils';
const MOCK_WEBSITE_CONTENT: WebsiteContent = {
  hero: { headline: "Your Business, Simplified.", subheadline: "We build smart web apps that help your business run smoother, faster, and smarter.", imageUrl: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
  howItWorks: [
  { title: "Tell us your needs", description: "Describe your business process and what you want to achieve." },
  { title: "We design & build", description: "Our experts craft a custom web application tailored for you." },
  { title: "Launch & manage", description: "Go live and easily manage your operations from anywhere." }],
  whyChooseUs: [
  { title: "Custom-built workflows", description: "Apps designed around your unique business processes." },
  { title: "Cloud-based & secure", description: "Access your app from anywhere with top-tier security." },
  { title: "Scales with you", description: "Our solutions grow as your business grows." },
  { title: "No tech skills needed", description: "We handle all the technical details, so you don't have to." }],
  portfolio: [
  { name: "CRM Dashboard", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
  { name: "Project Manager", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
  { name: "Inventory System", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
  { name: "Client Portal", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" }],
  pricing: [
  { name: "Starter", price: "PKR 999", features: ["1 Core Workflow", "Up to 5 Users", "Basic Support"], popular: false },
  { name: "Growth", price: "PKR 2499", features: ["Up to 3 Workflows", "Up to 20 Users", "Priority Support", "Integrations"], popular: true },
  { name: "Enterprise", price: "Custom", features: ["Unlimited Workflows", "Unlimited Users", "Dedicated Support", "Advanced Security"], popular: false }],
  testimonials: [
  { name: "Sarah L.", company: "CEO, Innovate Inc.", text: "AppChahiye transformed our operations. What used to take hours now takes minutes. A true game-changer!", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { name: "Mike R.", company: "Founder, Growth Co.", text: "The custom app they built for us is intuitive, fast, and perfectly tailored to our workflow. Highly recommended.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" }],
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
export class WebsiteContentEntity extends Entity<WebsiteContent> {
  static readonly entityName = "websiteContent";
  static readonly initialState: WebsiteContent = MOCK_WEBSITE_CONTENT;
  static async ensureExists(env: Env): Promise<WebsiteContentEntity> {
    const content = new WebsiteContentEntity(env, "singleton");
    if (!(await content.exists())) {
      await content.save(MOCK_WEBSITE_CONTENT);
    }
    return content;
  }
}
// --- User Entity ---
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: '',
    email: '',
    name: '',
    role: 'client',
    passwordHash: '',
    avatarUrl: '',
  };
}
// --- Client Entity ---
export class ClientEntity extends IndexedEntity<Client> {
  static readonly entityName = "client";
  static readonly indexName = "clients";
  static readonly initialState: Client = {
    id: '',
    userId: '',
    company: '',
    projectType: '',
    portalUrl: '/portal/:clientId',
    status: 'pending',
    createdAt: 0,
  };
}
// --- Project Entity ---
export class ProjectEntity extends IndexedEntity<Project> {
  static readonly entityName = "project";
  static readonly indexName = "projects";
  static readonly initialState: Project = {
    id: '',
    clientId: '',
    title: '',
    progress: 0,
    deadline: null,
    notes: '',
    updatedAt: 0,
  };
}
// --- Milestone Entity ---
export class MilestoneEntity extends IndexedEntity<Milestone> {
  static readonly entityName = "milestone";
  static readonly indexName = "milestones";
  static readonly initialState: Milestone = {
    id: '',
    projectId: '',
    title: '',
    description: '',
    status: 'todo',
    dueDate: null,
    files: [],
    updatedAt: 0,
  };
}
// --- Invoice Entity ---
export class InvoiceEntity extends IndexedEntity<Invoice> {
  static readonly entityName = "invoice";
  static readonly indexName = "invoices";
  static readonly initialState: Invoice = {
    id: '',
    clientId: '',
    amount: 0,
    status: 'pending',
    pdf_url: '',
    issuedAt: 0,
  };
}
// --- Message Entity ---
export class MessageEntity extends IndexedEntity<Message> {
  static readonly entityName = "message";
  static readonly indexName = "messages";
  static readonly initialState: Message = {
    id: '',
    clientId: '',
    senderId: '',
    receiverId: '',
    content: '',
    attachments: [],
    createdAt: 0,
  };
}