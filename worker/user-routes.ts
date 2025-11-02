import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity, UserEntity, ClientEntity } from "./entities";
import { ok, bad } from './core-utils';
import type { LoginResponse, WebsiteContent, ClientRegistrationResponse, User } from "@shared/types";
// A simple (and insecure) password hashing mock. Replace with a real library like bcrypt in production.
const mockHash = async (password: string) => `hashed_${password}`;
// Generates a random, memorable password.
const generatePassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- Mock Admin Authentication ---
  app.post('/api/admin/login', async (c) => {
    const { email, password } = await c.req.json();
    if (email === 'appchahiye@gmail.com' && password === 'Eiahta@840') {
      const user: LoginResponse['user'] = {
        id: 'admin-user-01',
        email: 'appchahiye@gmail.com',
        name: 'Admin User',
        role: 'admin',
      };
      const response: LoginResponse = {
        user,
        token: 'mock-jwt-token-for-appchahiye-admin',
      };
      return ok(c, response);
    }
    return bad(c, 'Invalid credentials');
  });
  // --- Client Registration ---
  app.post('/api/clients/register', async (c) => {
    const { name, email, company, projectType } = await c.req.json<{
      name: string;
      email: string;
      company: string;
      projectType: string;
    }>();
    if (!name || !email || !company || !projectType) {
      return bad(c, 'Missing required fields');
    }
    try {
      const userId = crypto.randomUUID();
      const password_plaintext = generatePassword();
      const passwordHash = await mockHash(password_plaintext);
      const newUser: User = {
        id: userId,
        name,
        email,
        role: 'client',
        passwordHash,
      };
      await UserEntity.create(c.env, newUser);
      const newClient = {
        id: userId, // Client ID is the same as User ID for simplicity
        userId,
        company,
        projectType,
        portalUrl: '/portal/:clientId',
        status: 'pending' as const,
        createdAt: Date.now(),
      };
      await ClientEntity.create(c.env, newClient);
      const response: ClientRegistrationResponse = {
        client: newClient,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        password_plaintext,
      };
      return ok(c, response);
    } catch (error) {
      console.error('Registration failed:', error);
      return bad(c, 'An error occurred during registration.');
    }
  });
  // --- Website Content Management ---
  app.get('/api/content', async (c) => {
    const contentEntity = await WebsiteContentEntity.ensureExists(c.env);
    const content = await contentEntity.getState();
    return ok(c, content);
  });
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