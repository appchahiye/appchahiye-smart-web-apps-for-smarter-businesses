import { Hono } from "hono";
import type { Env } from './core-utils';
import { WebsiteContentEntity, UserEntity, ClientEntity, ProjectEntity, MilestoneEntity, InvoiceEntity, MessageEntity, FormSubmissionEntity, ServiceEntity } from "./entities";
import { TenantEntity } from "./saas-entities";
import { ok, bad, notFound } from './core-utils';
import { uploadFile, getFile, deleteFile, generateFileKey, getContentType, listFiles } from './r2-utils';
import { getGoogleAuthUrl, exchangeCodeForTokens, getGoogleUserInfo, getCallbackUrl } from './google-auth';
import { registerSaasRoutes } from './saas-routes';
import { registerCrmAuthRoutes } from './crm-auth-routes';
import { registerMigrationRoutes } from './migration-routes';
import type { LoginResponse, WebsiteContent, ClientRegistrationResponse, User, Client, Project, Milestone, ProjectWithMilestones, Invoice, InvoiceWithClientInfo, Message, MessageWithSender, ClientProfile, UpdateClientProfilePayload, ChangePasswordPayload, FormSubmission, AdminDashboardStats, AnalyticsData, ActivityItem, NotificationPreferences, Service } from "@shared/types";
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
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
        notificationPreferences: {
          projectUpdates: true,
          newMessages: true,
        }
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

      // Auto-create workspace (tenant) for the new client
      const slug = company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) || `workspace-${Date.now()}`;

      await TenantEntity.create(c.env, {
        id: crypto.randomUUID(),
        name: company || 'My Workspace',
        slug: `${slug}-${userId.substring(0, 6)}`,
        ownerId: userId,
        plan: 'free',
        branding: {},
        settings: {
          timezone: 'Asia/Karachi',
          currency: 'PKR',
        },
      });

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
  app.put('/api/admin/clients/:clientId/status', async (c) => {
    const { clientId } = c.req.param();
    const { status } = await c.req.json<{ status: Client['status'] }>();
    if (!status || !['pending', 'active', 'completed'].includes(status)) {
      return bad(c, 'Invalid status provided.');
    }
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!(await clientEntity.exists())) {
      return notFound(c, 'Client not found.');
    }
    await clientEntity.patch({ status });
    return ok(c, { message: 'Client status updated successfully.' });
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
  // --- Admin: Service Management ---
  app.get('/api/admin/services', async (c) => {
    const { items: services } = await ServiceEntity.list(c.env);
    return ok(c, services);
  });
  app.post('/api/admin/services', async (c) => {
    const { name, description, type, price } = await c.req.json<Omit<Service, 'id'>>();
    if (!name || !type || price == null) return bad(c, 'Missing required fields');
    const newService: Service = {
      id: crypto.randomUUID(),
      name,
      description,
      type,
      price,
    };
    await ServiceEntity.create(c.env, newService);
    return ok(c, newService);
  });
  app.put('/api/admin/services/:serviceId', async (c) => {
    const { serviceId } = c.req.param();
    const updates = await c.req.json<Partial<Service>>();
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!(await serviceEntity.exists())) return notFound(c);
    await serviceEntity.patch(updates);
    return ok(c, await serviceEntity.getState());
  });
  app.delete('/api/admin/services/:serviceId', async (c) => {
    const { serviceId } = c.req.param();
    const deleted = await ServiceEntity.delete(c.env, serviceId);
    if (!deleted) return notFound(c, 'Service not found');
    return ok(c, { message: 'Service deleted' });
  });
  // --- Admin: Invoice Management ---
  app.get('/api/admin/invoices', async (c) => {
    const { items: invoices } = await InvoiceEntity.list(c.env);
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const { items: services } = await ServiceEntity.list(c.env);
    const clientsById = new Map(clients.map(cl => [cl.id, cl]));
    const usersById = new Map(users.map(u => [u.id, u]));
    const servicesById = new Map(services.map(s => [s.id, s]));
    const invoicesWithClientInfo: InvoiceWithClientInfo[] = invoices.map(inv => {
      const client = clientsById.get(inv.clientId);
      const user = client ? usersById.get(client.userId) : undefined;
      const invoiceServices = inv.serviceIds
        ? inv.serviceIds.map(id => servicesById.get(id)).filter((s): s is Service => s !== undefined)
        : [];
      return {
        ...inv,
        clientName: user?.name || 'N/A',
        clientCompany: client?.company || 'N/A',
        services: invoiceServices,
      };
    });
    return ok(c, invoicesWithClientInfo);
  });
  app.post('/api/admin/clients/:clientId/invoices', async (c) => {
    const { clientId } = c.req.param();
    const { serviceIds } = await c.req.json<{ serviceIds: string[] }>();
    if (!serviceIds || serviceIds.length === 0) {
      return bad(c, 'At least one service must be selected.');
    }
    const { items: allServices } = await ServiceEntity.list(c.env);
    const servicesById = new Map(allServices.map(s => [s.id, s]));
    let amount = 0;
    for (const id of serviceIds) {
      const service = servicesById.get(id);
      if (!service) return bad(c, `Service with ID ${id} not found.`);
      amount += service.price;
    }
    if (amount < 0) return bad(c, 'Total amount cannot be negative.');
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      clientId,
      amount,
      status: 'pending',
      pdf_url: `/mock-invoice-${crypto.randomUUID()}.pdf`,
      issuedAt: Date.now(),
      serviceIds,
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
    const { items: allServices } = await ServiceEntity.list(c.env);
    const servicesById = new Map(allServices.map(s => [s.id, s]));
    const invoicesWithServices = clientInvoices.map(inv => {
      const invoiceServices = inv.serviceIds
        ? inv.serviceIds.map(id => servicesById.get(id)).filter((s): s is Service => s !== undefined)
        : [];
      return { ...inv, services: invoiceServices };
    });
    return ok(c, invoicesWithServices);
  });
  app.get('/api/portal/:clientId/services', async (c) => {
    const { items: services } = await ServiceEntity.list(c.env);
    return ok(c, services);
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
  app.get('/api/portal/:clientId/notifications', async (c) => {
    const { clientId } = c.req.param();
    const userEntity = new UserEntity(c.env, clientId);
    if (!(await userEntity.exists())) {
      return notFound(c, 'User not found');
    }
    const user = await userEntity.getState();
    return ok(c, user.notificationPreferences || { projectUpdates: true, newMessages: true });
  });
  app.put('/api/portal/:clientId/notifications', async (c) => {
    const { clientId } = c.req.param();
    const prefs = await c.req.json<NotificationPreferences>();
    const userEntity = new UserEntity(c.env, clientId);
    if (!(await userEntity.exists())) {
      return notFound(c, 'User not found');
    }
    await userEntity.patch({ notificationPreferences: prefs });
    return ok(c, { message: 'Preferences updated.' });
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
  // --- Form Submission ---
  app.post('/api/forms/submit', async (c) => {
    const body = await c.req.json<Omit<FormSubmission, 'id' | 'submittedAt'>>();
    if (!body.name || !body.email || !body.projectDescription) {
      return bad(c, 'Missing required fields');
    }
    try {
      const newSubmission: FormSubmission = {
        id: crypto.randomUUID(),
        ...body,
        submittedAt: Date.now(),
      };
      await FormSubmissionEntity.create(c.env, newSubmission);
      return ok(c, { message: 'Form submitted successfully!' });
    } catch (error) {
      console.error('Form submission failed:', error);
      return bad(c, 'An error occurred during submission.');
    }
  });
  app.get('/api/admin/forms', async (c) => {
    const { items } = await FormSubmissionEntity.list(c.env);
    items.sort((a, b) => b.submittedAt - a.submittedAt);
    return ok(c, items);
  });
  // --- Dynamic Data Endpoints ---
  app.get('/api/admin/dashboard-stats', async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: projects } = await ProjectEntity.list(c.env);
    const totalLeads = clients.length;
    const activeClients = clients.filter(cl => cl.status === 'active').length;
    const projectsInProgress = projects.filter(p => p.progress < 100).length;
    const conversionRate = totalLeads > 0 ? (activeClients / totalLeads) * 100 : 0;
    const stats: AdminDashboardStats = {
      totalLeads,
      activeClients,
      projectsInProgress,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
    };
    return ok(c, stats);
  });
  app.get('/api/admin/analytics-data', async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: projects } = await ProjectEntity.list(c.env);
    // Leads per month (last 6 months)
    const leadsPerMonth: { [key: string]: number } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      leadsPerMonth[monthKey] = 0;
    }
    clients.forEach(client => {
      const clientDate = new Date(client.createdAt);
      if (clientDate >= sixMonthsAgo) {
        const monthKey = clientDate.toLocaleString('default', { month: 'short' });
        if (leadsPerMonth[monthKey] !== undefined) {
          leadsPerMonth[monthKey]++;
        }
      }
    });
    // Project completion times
    const clientsById = new Map(clients.map(cl => [cl.id, cl]));
    const completedProjects = projects.filter(p => p.progress === 100);
    const projectCompletionTimes = completedProjects.slice(0, 10).map(p => {
      const client = clientsById.get(p.clientId);
      const startTime = client ? client.createdAt : p.updatedAt;
      const endTime = p.updatedAt;
      const timeDiff = endTime - startTime;
      const days = Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24)));
      return { name: p.title.substring(0, 10) + '...', time: days };
    });
    const data: AnalyticsData = {
      leadsPerMonth: Object.entries(leadsPerMonth).map(([name, leads]) => ({ name, leads })),
      projectCompletionTimes,
    };
    return ok(c, data);
  });
  app.get('/api/portal/:clientId/activity', async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const clientProjects = allProjects.filter(p => p.clientId === clientId);
    const clientProjectIds = new Set(clientProjects.map(p => p.id));
    const clientMilestones = allMilestones.filter(m => clientProjectIds.has(m.projectId));
    const activity: ActivityItem[] = [];
    clientProjects.forEach(p => {
      activity.push({
        id: `p-${p.id}`,
        type: 'project_created',
        text: `Project "${p.title}" was created.`,
        timestamp: p.updatedAt, // Assuming creation time is last update for simplicity
      });
    });
    clientMilestones.forEach(m => {
      activity.push({
        id: `m-${m.id}`,
        type: 'milestone_updated',
        text: `Milestone "${m.title}" was updated to "${m.status.replace('_', ' ')}".`,
        timestamp: m.updatedAt,
      });
    });
    activity.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, activity.slice(0, 10)); // Return latest 10 activities
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

  // ===========================================
  // R2 File Storage Endpoints
  // ===========================================

  // Upload a file
  app.post('/api/upload', async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'content';
      const entityId = (formData.get('entityId') as string) || crypto.randomUUID();

      if (!file) {
        return bad(c, 'No file provided');
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return bad(c, 'File size exceeds 10MB limit');
      }

      const validFolders = ['avatars', 'milestones', 'invoices', 'content', 'attachments'] as const;
      const safeFolder = validFolders.includes(folder as typeof validFolders[number])
        ? (folder as typeof validFolders[number])
        : 'content';

      const key = generateFileKey(safeFolder, entityId, file.name);
      const contentType = file.type || getContentType(file.name);
      const arrayBuffer = await file.arrayBuffer();

      const result = await uploadFile(c.env, key, arrayBuffer, contentType, {
        originalName: file.name,
        size: file.size,
      });

      return ok(c, result);
    } catch (error) {
      console.error('Upload failed:', error);
      return bad(c, 'File upload failed');
    }
  });

  // Get/download a file
  app.get('/api/files/*', async (c) => {
    const key = c.req.path.replace('/api/files/', '');

    if (!key) {
      return bad(c, 'File key is required');
    }

    const result = await getFile(c.env, key);

    if (!result) {
      return notFound(c, 'File not found');
    }

    const headers = new Headers();
    headers.set('Content-Type', result.metadata.contentType);
    headers.set('Content-Length', result.metadata.size.toString());
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // For non-image files, suggest download
    if (!result.metadata.contentType.startsWith('image/')) {
      headers.set('Content-Disposition', `attachment; filename="${result.metadata.originalName}"`);
    }

    return new Response(result.object.body, { headers });
  });

  // Delete a file
  app.delete('/api/files/*', async (c) => {
    const key = c.req.path.replace('/api/files/', '');

    if (!key) {
      return bad(c, 'File key is required');
    }

    const deleted = await deleteFile(c.env, key);

    if (!deleted) {
      return notFound(c, 'File not found or could not be deleted');
    }

    return ok(c, { message: 'File deleted successfully' });
  });

  // List files in a folder
  app.get('/api/files-list/:folder', async (c) => {
    const { folder } = c.req.param();
    const entityId = c.req.query('entityId');

    const prefix = entityId ? `${folder}/${entityId}/` : `${folder}/`;
    const result = await listFiles(c.env, prefix);

    return ok(c, result);
  });

  // ===========================================
  // Google OAuth Endpoints
  // ===========================================

  // Redirect to Google login
  app.get('/api/auth/google', async (c) => {
    const callbackUrl = getCallbackUrl(c.req.raw);
    const authUrl = getGoogleAuthUrl(c.env, callbackUrl);
    return c.redirect(authUrl);
  });

  // Handle Google OAuth callback
  app.get('/api/auth/google/callback', async (c) => {
    const code = c.req.query('code');
    const error = c.req.query('error');

    if (error) {
      return c.redirect('/?error=google_auth_denied');
    }

    if (!code) {
      return c.redirect('/?error=no_auth_code');
    }

    try {
      const callbackUrl = getCallbackUrl(c.req.raw);

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(c.env, code, callbackUrl);

      // Get user info from Google
      const googleUser = await getGoogleUserInfo(tokens.access_token);

      // Check if user already exists
      const existingUsers = await UserEntity.list(c.env);
      let existingUser = existingUsers.items.find(u => u.email === googleUser.email);

      let userId: string;
      let clientId: string;
      let isNewUser = false;

      if (existingUser) {
        // User exists - find their client record
        userId = existingUser.id;
        const clients = await ClientEntity.list(c.env);
        const client = clients.items.find(cl => cl.userId === userId);
        if (client) {
          clientId = client.id;
        } else {
          // User exists but no client - create one
          const newClient = await ClientEntity.create(c.env, {
            id: userId,
            userId: userId,
            company: googleUser.name + "'s Company",
            portalUrl: '/portal/:clientId',
            projectType: 'Google OAuth Signup',
            status: 'pending',
            createdAt: Date.now(),
          });
          clientId = newClient.id;
        }
      } else {
        // New user - create user and client
        isNewUser = true;
        userId = crypto.randomUUID();
        clientId = userId;

        // Create user
        await UserEntity.create(c.env, {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          role: 'client',
          passwordHash: `google_oauth_${googleUser.id}`,
          avatarUrl: googleUser.picture,
        });

        // Create client
        await ClientEntity.create(c.env, {
          id: clientId,
          userId: userId,
          company: googleUser.name + "'s Company",
          portalUrl: '/portal/:clientId',
          projectType: 'Google OAuth Signup',
          status: 'pending',
          createdAt: Date.now(),
        });
      }

      // Redirect to portal with success indicator
      const portalUrl = `/portal/${clientId}?auth=google&welcome=${isNewUser ? 'true' : 'false'}`;
      return c.redirect(portalUrl);

    } catch (err) {
      console.error('Google OAuth error:', err);
      return c.redirect('/?error=google_auth_failed');
    }
  });

  // Register all SaaS routes
  registerSaasRoutes(app);

  // Register CRM auth routes
  registerCrmAuthRoutes(app);

  // Register migration routes
  registerMigrationRoutes(app);
}
