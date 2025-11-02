import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity, UserEntity, ClientEntity, ProjectEntity, MilestoneEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { LoginResponse, WebsiteContent, ClientRegistrationResponse, User, Client, Project, Milestone, ProjectWithMilestones } from "@shared/types";
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
      const newClient: Client = {
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
  // --- Admin: Client & Project Management ---
  app.get('/api/admin/clients', async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const usersById = new Map(users.map(u => [u.id, u]));
    const clientsWithUsers = clients.map(client => ({
      ...client,
      user: usersById.get(client.userId)
    }));
    return ok(c, clientsWithUsers);
  });
  app.get('/api/admin/clients/:clientId/projects', async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const clientProjects = allProjects.filter(p => p.clientId === clientId);
    return ok(c, clientProjects);
  });
  app.post('/api/admin/clients/:clientId/projects', async (c) => {
    const { clientId } = c.req.param();
    const { title } = await c.req.json<{ title: string }>();
    if (!title) return bad(c, 'Title is required');
    const newProject: Project = {
      id: crypto.randomUUID(),
      clientId,
      title,
      progress: 0,
      deadline: null,
      notes: '',
      updatedAt: Date.now(),
    };
    await ProjectEntity.create(c.env, newProject);
    return ok(c, newProject);
  });
  app.put('/api/admin/projects/:projectId', async (c) => {
    const { projectId } = c.req.param();
    const updates = await c.req.json<Partial<Project>>();
    const projectEntity = new ProjectEntity(c.env, projectId);
    if (!(await projectEntity.exists())) return notFound(c);
    await projectEntity.patch({ ...updates, updatedAt: Date.now() });
    return ok(c, await projectEntity.getState());
  });
  app.post('/api/admin/projects/:projectId/milestones', async (c) => {
    const { projectId } = c.req.param();
    const { title, description } = await c.req.json<{ title: string; description: string }>();
    if (!title) return bad(c, 'Title is required');
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      projectId,
      title,
      description,
      status: 'todo',
      dueDate: null,
      files: [],
      updatedAt: Date.now(),
    };
    await MilestoneEntity.create(c.env, newMilestone);
    return ok(c, newMilestone);
  });
  app.put('/api/admin/milestones/:milestoneId', async (c) => {
    const { milestoneId } = c.req.param();
    const updates = await c.req.json<Partial<Milestone>>();
    const milestoneEntity = new MilestoneEntity(c.env, milestoneId);
    if (!(await milestoneEntity.exists())) return notFound(c);
    await milestoneEntity.patch({ ...updates, updatedAt: Date.now() });
    return ok(c, await milestoneEntity.getState());
  });
  // --- Client Portal Data ---
  app.get('/api/portal/:clientId/projects', async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const clientProjects = allProjects.filter(p => p.clientId === clientId);
    const projectsWithMilestones: ProjectWithMilestones[] = clientProjects.map(project => ({
      ...project,
      milestones: allMilestones
        .filter(m => m.projectId === project.id)
        .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0)),
    }));
    return ok(c, projectsWithMilestones);
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