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
  };
  token: string;
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
export interface WebsiteContent {
  hero: HeroContent;
  howItWorks: StepContent[];
  whyChooseUs: FeatureContent[];
  portfolio: PortfolioItem[];
  pricing: PricingTier[];
  testimonials: Testimonial[];
  finalCta: CtaContent;
}