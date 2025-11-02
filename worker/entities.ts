import { Entity } from "./core-utils";
import type { WebsiteContent } from "@shared/types";
// --- Mock Data for Initial Website Content ---
const MOCK_WEBSITE_CONTENT: WebsiteContent = {
  hero: {
    headline: "Your Business, Simplified.",
    subheadline: "We build smart web apps that help your business run smoother, faster, and smarter.",
    imageUrl: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png",
  },
  howItWorks: [
    { title: "Tell us your needs", description: "Describe your business process and what you want to achieve." },
    { title: "We design & build", description: "Our experts craft a custom web application tailored for you." },
    { title: "Launch & manage", description: "Go live and easily manage your operations from anywhere." },
  ],
  whyChooseUs: [
    { title: "Custom-built workflows", description: "Apps designed around your unique business processes." },
    { title: "Cloud-based & secure", description: "Access your app from anywhere with top-tier security." },
    { title: "Scales with you", description: "Our solutions grow as your business grows." },
    { title: "No tech skills needed", description: "We handle all the technical details, so you don't have to." },
  ],
  portfolio: [
    { name: "CRM Dashboard", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Project Manager", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
    { name: "Inventory System", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Client Portal", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
  ],
  pricing: [
    { name: "Starter", price: "$999", features: ["1 Core Workflow", "Up to 5 Users", "Basic Support"], popular: false },
    { name: "Growth", price: "$2499", features: ["Up to 3 Workflows", "Up to 20 Users", "Priority Support", "Integrations"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited Workflows", "Unlimited Users", "Dedicated Support", "Advanced Security"], popular: false },
  ],
  testimonials: [
    { name: "Sarah L.", company: "CEO, Innovate Inc.", text: "AppChahiye transformed our operations. What used to take hours now takes minutes. A true game-changer!", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Mike R.", company: "Founder, Growth Co.", text: "The custom app they built for us is intuitive, fast, and perfectly tailored to our workflow. Highly recommended.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
  ],
  finalCta: {
    headline: "Ready to simplify your business?",
    subheadline: "Let's build the perfect web app to streamline your operations and fuel your growth.",
  },
};
// --- Website Content Entity ---
// This is a singleton entity to hold all website content.
export class WebsiteContentEntity extends Entity<WebsiteContent> {
  static readonly entityName = "websiteContent";
  static readonly initialState: WebsiteContent = MOCK_WEBSITE_CONTENT;
  // Helper to ensure the singleton content exists with initial data
  static async ensureExists(env: Env): Promise<WebsiteContentEntity> {
    const content = new WebsiteContentEntity(env, "singleton");
    if (!(await content.exists())) {
      await content.save(MOCK_WEBSITE_CONTENT);
    }
    return content;
  }
}