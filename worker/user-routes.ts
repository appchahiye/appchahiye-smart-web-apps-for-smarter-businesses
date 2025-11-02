import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity, UserEntity, ClientEntity, ProjectEntity, MilestoneEntity, InvoiceEntity, MessageEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { LoginResponse, WebsiteContent, ClientRegistrationResponse, User, Client, Project, Milestone, ProjectWithMilestones, Invoice, InvoiceWithClientInfo, Message, MessageWithSender, ClientProfile, UpdateClientProfilePayload, ChangePasswordPayload } from "@shared/types";
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
      const userState = await adminUserEntity.getState();
      const user: LoginResponse['user'] = {
        id: adminId,
        email: 'appchahiye@gmail.com',
        name: 'Admin User',
        role: 'admin',
        avatarUrl: userState.avatarUrl,
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
    const { items: users } = await UserEntity.list(c.env);
    if (users.some(u => u.email === email)) {
      return bad(c, 'A user with this email already exists.');
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
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`
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
  // --- Client Login ---
  app.post('/api/clients/login', async (c) => {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) {
      return bad(c, 'Email and password are required');
    }
    const { items: users } = await UserEntity.list(c.env);
    const user = users.find(u => u.email === email);
    if (!user) {
      return bad(c, 'User not found');
    }
    const passwordHash = await mockHash(password);
    if (user.passwordHash !== passwordHash) {
      return bad(c, 'Invalid credentials');
    }
    if (user.role !== 'client') {
      return bad(c, 'Access denied');
    }
    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token: `mock-jwt-token-for-client-${user.id}`,
    };
    return ok(c, response);
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
  // --- Client Account Management ---
  app.get('/api/portal/:clientId/account', async (c) => {
    const { clientId } = c.req.param();
    const userEntity = new UserEntity(c.env, clientId);
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!(await userEntity.exists()) || !(await clientEntity.exists())) {
      return notFound(c, 'Client account not found');
    }
    const user = await userEntity.getState();
    const client = await clientEntity.getState();
    const profile: ClientProfile = {
      name: user.name,
      email: user.email,
      company: client.company,
      avatarUrl: user.avatarUrl,
    };
    return ok(c, profile);
  });
  app.put('/api/portal/:clientId/account', async (c) => {
    const { clientId } = c.req.param();
    const { name, company, avatarUrl } = await c.req.json<UpdateClientProfilePayload>();
    if (!name || !company) return bad(c, 'Name and company are required');
    const userEntity = new UserEntity(c.env, clientId);
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!(await userEntity.exists()) || !(await clientEntity.exists())) {
      return notFound(c, 'Client account not found');
    }
    await userEntity.patch({ name, avatarUrl });
    await clientEntity.patch({ company });
    return ok(c, { message: 'Profile updated successfully' });
  });
  app.post('/api/portal/:clientId/change-password', async (c) => {
    const { clientId } = c.req.param();
    const { currentPassword, newPassword } = await c.req.json<ChangePasswordPayload>();
    if (!currentPassword || !newPassword) return bad(c, 'All password fields are required');
    const userEntity = new UserEntity(c.env, clientId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    const currentPasswordHash = await mockHash(currentPassword);
    if (user.passwordHash !== currentPasswordHash) {
      return bad(c, 'Current password does not match');
    }
    const newPasswordHash = await mockHash(newPassword);
    await userEntity.patch({ passwordHash: newPasswordHash });
    return ok(c, { message: 'Password changed successfully' });
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
    console.log('Received content for update:', newContent);
    if (!newContent) {
      return bad(c, 'Invalid content data');
    }
    await contentEntity.save(newContent);
    console.log('Content saved successfully.');
    return ok(c, { message: 'Content updated successfully' });
  });
  // --- DELETE Endpoints ---
  app.delete('/api/admin/invoices/:invoiceId', async (c) => {
    const { invoiceId } = c.req.param();
    const deleted = await InvoiceEntity.delete(c.env, invoiceId);
    if (!deleted) return notFound(c, 'Invoice not found');
    return ok(c, { message: 'Invoice deleted' });
  });
  app.delete('/api/admin/milestones/:milestoneId', async (c) => {
    const { milestoneId } = c.req.param();
    const deleted = await MilestoneEntity.delete(c.env, milestoneId);
    if (!deleted) return notFound(c, 'Milestone not found');
    return ok(c, { message: 'Milestone deleted' });
  });
  app.delete('/api/admin/projects/:projectId', async (c) => {
    const { projectId } = c.req.param();
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const milestonesToDelete = allMilestones.filter(m => m.projectId === projectId).map(m => m.id);
    await MilestoneEntity.deleteMany(c.env, milestonesToDelete);
    const deleted = await ProjectEntity.delete(c.env, projectId);
    if (!deleted) return notFound(c, 'Project not found');
    return ok(c, { message: 'Project and its milestones deleted' });
  });
  app.delete('/api/chat/:clientId', async (c) => {
    const { clientId } = c.req.param();
    const { items: allMessages } = await MessageEntity.list(c.env);
    const messagesToDelete = allMessages.filter(m => m.clientId === clientId).map(m => m.id);
    const deletedCount = await MessageEntity.deleteMany(c.env, messagesToDelete);
    return ok(c, { message: `${deletedCount} messages deleted` });
  });
  app.delete('/api/admin/clients/:clientId', async (c) => {
    const { clientId } = c.req.param();
    // 1. Delete Projects and their Milestones
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const clientProjects = allProjects.filter(p => p.clientId === clientId);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    for (const project of clientProjects) {
      const milestonesToDelete = allMilestones.filter(m => m.projectId === project.id).map(m => m.id);
      await MilestoneEntity.deleteMany(c.env, milestonesToDelete);
      await ProjectEntity.delete(c.env, project.id);
    }
    // 2. Delete Invoices
    const { items: allInvoices } = await InvoiceEntity.list(c.env);
    const invoicesToDelete = allInvoices.filter(i => i.clientId === clientId).map(i => i.id);
    await InvoiceEntity.deleteMany(c.env, invoicesToDelete);
    // 3. Delete Chat Messages
    const { items: allMessages } = await MessageEntity.list(c.env);
    const messagesToDelete = allMessages.filter(m => m.clientId === clientId).map(m => m.id);
    await MessageEntity.deleteMany(c.env, messagesToDelete);
    // 4. Delete Client and User
    const clientDeleted = await ClientEntity.delete(c.env, clientId);
    await UserEntity.delete(c.env, clientId); // Assuming userId is same as clientId
    if (!clientDeleted) return notFound(c, 'Client not found');
    return ok(c, { message: 'Client and all associated data deleted' });
  });
}