export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// --- Authentication Types ---
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}
export interface LoginResponse {
  user: AuthUser;
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