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
// --- Invoicing Types ---
export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'paid';
  pdf_url: string; // For mock download
  issuedAt: number; // epoch millis
}
export interface InvoiceWithClientInfo extends Invoice {
  clientName: string;
  clientCompany: string;
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