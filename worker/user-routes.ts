import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity, UserEntity, ClientEntity, ProjectEntity, MilestoneEntity, InvoiceEntity, MessageEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { LoginResponse, WebsiteContent, ClientRegistrationResponse, User, Client, Project, Milestone, ProjectWithMilestones, Invoice, InvoiceWithClientInfo, Message, MessageWithSender } from "@shared/types";
// A simple (and insecure) password hashing mock. Replace with a real library like bcrypt in production.
const mockHash = async (password: string) => `hashed_${password}`;
// Generates a random, memorable password.
const generatePassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01223456789';
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
      const adminId = 'admin-user-01';
      const adminUserEntity = new UserEntity(c.env, adminId);
      if (!(await adminUserEntity.exists())) {
        await UserEntity.create(c.env, {
          id: adminId,
          email: 'appchahiye@gmail.com',
          name: 'Admin User',
          role: 'admin',
          passwordHash: await mockHash('Eiahta@840'),
        });
      }
      const user: LoginResponse['user'] = {
        id: adminId,
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
  // --- Admin: Invoice Management ---
  app.get('/api/admin/invoices', async (c) => {
    const { items: invoices } = await InvoiceEntity.list(c.env);
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const clientsById = new Map(clients.map(cl => [cl.id, cl]));
    const usersById = new Map(users.map(u => [u.id, u]));
    const invoicesWithClientInfo: InvoiceWithClientInfo[] = invoices.map(inv => {
      const client = clientsById.get(inv.clientId);
      const user = client ? usersById.get(client.userId) : undefined;
      return {
        ...inv,
        clientName: user?.name || 'N/A',
        clientCompany: client?.company || 'N/A',
      };
    });
    return ok(c, invoicesWithClientInfo);
  });
  app.post('/api/admin/clients/:clientId/invoices', async (c) => {
    const { clientId } = c.req.param();
    const { amount } = await c.req.json<{ amount: number }>();
    if (!amount || amount <= 0) return bad(c, 'A valid amount is required');
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      clientId,
      amount,
      status: 'pending',
      pdf_url: `/mock-invoice-${crypto.randomUUID()}.pdf`,
      issuedAt: Date.now(),
    };
    await InvoiceEntity.create(c.env, newInvoice);
    return ok(c, newInvoice);
  });
  app.put('/api/admin/invoices/:invoiceId', async (c) => {
    const { invoiceId } = c.req.param();
    const { status } = await c.req.json<{ status: 'pending' | 'paid' }>();
    if (!status || !['pending', 'paid'].includes(status)) return bad(c, 'Invalid status');
    const invoiceEntity = new InvoiceEntity(c.env, invoiceId);
    if (!(await invoiceEntity.exists())) return notFound(c);
    await invoiceEntity.patch({ status });
    return ok(c, await invoiceEntity.getState());
  });
  // --- Chat System ---
  app.get('/api/chat/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { items: allMessages } = await MessageEntity.list(c.env);
    const conversationMessages = allMessages.filter(m => m.clientId === clientId);
    const { items: allUsers } = await UserEntity.list(c.env);
    const usersById = new Map(allUsers.map(u => [u.id, u]));
    const adminId = 'admin-user-01';
    if (!usersById.has(adminId)) {
        const admin: User = { id: adminId, email: 'appchahiye@gmail.com', name: 'Admin User', role: 'admin', passwordHash: '' };
        await UserEntity.create(c.env, admin);
        usersById.set(admin.id, admin);
    }
    const messagesWithSender: MessageWithSender[] = conversationMessages.map(msg => {
      const sender = usersById.get(msg.senderId);
      return {
        ...msg,
        sender: {
          name: sender?.name || 'Unknown',
          role: sender?.role || 'client',
        },
      };
    }).sort((a, b) => a.createdAt - b.createdAt);
    return ok(c, messagesWithSender);
  });
  app.post('/api/chat/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { senderId, content } = await c.req.json<{ senderId: string; content: string }>();
    if (!senderId || !content) return bad(c, 'Sender and content are required');
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!(await clientEntity.exists())) return notFound(c, 'Client not found');
    const { items: allUsers } = await UserEntity.list(c.env);
    const adminUser = allUsers.find(u => u.role === 'admin');
    if (!adminUser) return bad(c, 'Admin user not configured');
    const sender = allUsers.find(u => u.id === senderId);
    if (!sender) return notFound(c, 'Sender not found');
    const receiverId = sender.role === 'admin' ? clientId : adminUser.id;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      clientId,
      senderId,
      receiverId,
      content,
      attachments: [],
      createdAt: Date.now(),
    };
    await MessageEntity.create(c.env, newMessage);
    return ok(c, newMessage);
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
  app.get('/api/portal/:clientId/invoices', async (c) => {
    const { clientId } = c.req.param();
    const { items: allInvoices } = await InvoiceEntity.list(c.env);
    const clientInvoices = allInvoices.filter(inv => inv.clientId === clientId);
    return ok(c, clientInvoices);
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