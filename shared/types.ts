export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// --- User & Client Types ---
export type UserRole = 'admin' | 'client';
export interface User {
  id: string;
  email: string;
  name:string;
  role: UserRole;
  passwordHash: string; // Stored on backend
  avatarUrl?: string;
  notificationPreferences?: {
    projectUpdates: boolean;
    newMessages: boolean;
  };
}
export interface Client {
  id: string; // Corresponds to User ID
  userId: string;
  company: string;
  projectType: string;
  portalUrl: string;
  status: 'active' | 'pending' | 'completed';
  createdAt: number; // epoch millis
}
export interface ClientRegistrationResponse {
  client: Client;
  user: {
    id: string;
    email: string;
    name: string;
  };
  password_plaintext: string; // Only sent on creation
}
// --- Authentication Types ---
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
  };
  token: string;
}
// --- Project Management Types ---
export interface Project {
  id: string;
  clientId: string;
  title: string;
  progress: number; // 0-100
  deadline: number | null; // epoch millis
  notes: string;
  updatedAt: number; // epoch millis
}
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: number | null; // epoch millis
  files: string[]; // Array of URLs
  updatedAt: number; // epoch millis
}
export interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
}
// --- Service Management Types ---
export interface Service {
  id: string;
  name: string;
  description: string;
  type: 'one-time' | 'recurring';
  price: number;
}
// --- Invoicing Types ---
export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'paid';
  pdf_url: string; // For mock download
  issuedAt: number; // epoch millis
  serviceIds?: string[];
}
export interface InvoiceWithClientInfo extends Invoice {
  clientName: string;
  clientCompany: string;
  services?: Service[];
}
// --- Chat Types ---
export interface Message {
  id: string;
  clientId: string; // Links the message to a client's conversation
  senderId: string; // User ID of the sender (can be admin or client)
  receiverId: string; // User ID of the receiver
  content: string;
  attachments: string[]; // Array of URLs
  createdAt: number; // epoch millis
}
export interface MessageWithSender extends Message {
  sender: {
    name: string;
    role: UserRole;
  };
}
// --- Client Account Management Types ---
export interface ClientProfile {
  name: string;
  email: string;
  company: string;
  avatarUrl?: string;
}
export interface UpdateClientProfilePayload {
  name: string;
  company: string;
  avatarUrl?: string;
}
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
export interface NotificationPreferences {
    projectUpdates: boolean;
    newMessages: boolean;
}
// --- Website Content Types ---
export interface HeroContent {
  headline: string;
  subheadline: string;
  imageUrl: string;
}
export interface StepContent {
  title: string;
  description: string;
}
export interface FeatureContent {
  title: string;
  description: string;
}
export interface PortfolioItem {
  name: string;
  image: string;
  description?: string;
}
export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  popular: boolean;
}
export interface Testimonial {
  name: string;
  company: string;
  text: string;
  avatar: string;
}
export interface CtaContent {
  headline: string;
  subheadline: string;
}
export interface BrandAssets {
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}
export interface SeoMetadata {
  siteTitle: string;
  metaDescription: string;
}
export interface WebsiteContent {
  hero: HeroContent;
  howItWorks: StepContent[];
  whyChooseUs: FeatureContent[];
  portfolio: PortfolioItem[];
  pricing: PricingTier[];
  testimonials: Testimonial[];
  finalCta: CtaContent;
  brandAssets: BrandAssets;
  seoMetadata: SeoMetadata;
}
// --- Form Submission Type ---
export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  features: string;
  submittedAt: number; // epoch millis
}
// --- Admin Dashboard & Analytics Types ---
export interface AdminDashboardStats {
  totalLeads: number;
  activeClients: number;
  projectsInProgress: number;
  conversionRate: number; // as a percentage
}
export interface AnalyticsData {
  leadsPerMonth: { name: string; leads: number }[];
  projectCompletionTimes: { name: string; time: number }[]; // time in days
}
// --- Client Portal Activity Feed ---
export interface ActivityItem {
  id: string;
  type: 'project_created' | 'milestone_updated' | 'milestone_created';
  text: string;
  timestamp: number; // epoch millis
}