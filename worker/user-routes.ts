import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { AuthUser, LoginResponse, WebsiteContent } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- Mock Admin Authentication ---
  app.post('/api/admin/login', async (c) => {
    const { email, password } = await c.req.json();
    // IMPORTANT: This is mock authentication. In a real app, use a secure method.
    if (email === 'appchahiye@gmail.com' && password === 'Eiahta@840') {
      const user: AuthUser = {
        id: 'admin-user-01',
        email: 'appchahiye@gmail.com',
        name: 'Admin User',
      };
      const response: LoginResponse = {
        user,
        token: 'mock-jwt-token-for-appchahiye-admin', // This is a mock token
      };
      return ok(c, response);
    }
    return bad(c, 'Invalid credentials');
  });
  // --- Website Content Management ---
  app.get('/api/content', async (c) => {
    const contentEntity = await WebsiteContentEntity.ensureExists(c.env);
    const content = await contentEntity.getState();
    return ok(c, content);
  });
  // This is a "protected" route in concept. The frontend will only call it
  // when an admin is logged in. A real implementation would validate a JWT.
  app.put('/api/content', async (c) => {
    const contentEntity = await WebsiteContentEntity.ensureExists(c.env);
    const newContent = await c.req.json<WebsiteContent>();
    if (!newContent) {
      return bad(c, 'Invalid content data');
    }
    await contentEntity.save(newContent);
    return ok(c, { message: 'Content updated successfully' });
  });
}