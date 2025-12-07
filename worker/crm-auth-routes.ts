/**
 * CRM User Authentication Routes
 * 
 * Separate auth system for CRM users (team members)
 * These are different from AppChahiye users
 */

import { Hono } from 'hono';
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { CrmUserEntity, CrmSessionEntity, CrmAppEntity } from './saas-entities';
import { DEFAULT_ROLE_PERMISSIONS } from '@shared/saas-types';

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'crm-salt-v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
}

// Generate secure token
function generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Token expiry: 7 days
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Register CRM auth routes
 */
export function registerCrmAuthRoutes(app: Hono<{ Bindings: Env }>) {

    // ===========================================
    // CRM User Login
    // ===========================================

    app.post('/api/crm/:appId/auth/login', async (c) => {
        const { appId } = c.req.param();
        const { email, password } = await c.req.json<{ email: string; password: string }>();

        if (!email || !password) {
            return bad(c, 'Email and password are required');
        }

        // Find user by email in this CRM
        const result = await CrmUserEntity.getByEmail(c.env, appId, email);
        if (!result) {
            return bad(c, 'Invalid email or password');
        }

        const { user, passwordHash } = result;

        // Verify password
        const isValid = await verifyPassword(password, passwordHash);
        if (!isValid) {
            return bad(c, 'Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            return bad(c, 'Account is deactivated');
        }

        // Generate session token
        const token = generateToken();
        const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

        await CrmSessionEntity.create(c.env, {
            id: crypto.randomUUID(),
            userId: user.id,
            token,
            expiresAt,
        });

        // Update last login
        await CrmUserEntity.update(c.env, user.id, { lastLoginAt: Date.now() });

        return ok(c, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                permissions: user.permissions,
            },
            token,
            expiresAt,
        });
    });

    // ===========================================
    // CRM User Logout
    // ===========================================

    app.post('/api/crm/:appId/auth/logout', async (c) => {
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token) {
            const session = await CrmSessionEntity.getByToken(c.env, token);
            if (session) {
                await CrmSessionEntity.deleteByUserId(c.env, session.userId);
            }
        }

        return ok(c, { success: true });
    });

    // ===========================================
    // Verify Session / Get Current User
    // ===========================================

    app.get('/api/crm/:appId/auth/me', async (c) => {
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return c.json({ success: false, error: 'No token provided' }, 401);
        }

        const session = await CrmSessionEntity.getByToken(c.env, token);
        if (!session) {
            return c.json({ success: false, error: 'Invalid or expired token' }, 401);
        }

        const user = await CrmUserEntity.getById(c.env, session.userId);
        if (!user || !user.isActive) {
            return c.json({ success: false, error: 'User not found or inactive' }, 401);
        }

        return ok(c, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                permissions: user.permissions,
            },
        });
    });

    // ===========================================
    // Register First User (Owner)
    // ===========================================

    app.post('/api/crm/:appId/auth/setup', async (c) => {
        const { appId } = c.req.param();
        const { email, password, name } = await c.req.json<{
            email: string;
            password: string;
            name: string;
        }>();

        if (!email || !password || !name) {
            return bad(c, 'Email, password, and name are required');
        }

        if (password.length < 6) {
            return bad(c, 'Password must be at least 6 characters');
        }

        // Check if CRM exists
        const app = await CrmAppEntity.getById(c.env, appId);
        if (!app) {
            return notFound(c, 'CRM not found');
        }

        // Check if there are existing users (setup only works for first user)
        const existingUsers = await CrmUserEntity.getByAppId(c.env, appId);
        if (existingUsers.length > 0) {
            return bad(c, 'CRM already has users. Use invite to add more.');
        }

        // Create owner user
        const passwordHash = await hashPassword(password);
        const user = await CrmUserEntity.create(c.env, {
            id: crypto.randomUUID(),
            appId,
            email,
            name,
            passwordHash,
            role: 'owner',
            permissions: DEFAULT_ROLE_PERMISSIONS.owner,
            isActive: true,
        });

        // Generate session
        const token = generateToken();
        const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

        await CrmSessionEntity.create(c.env, {
            id: crypto.randomUUID(),
            userId: user.id,
            token,
            expiresAt,
        });

        return ok(c, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
            expiresAt,
        });
    });

    // ===========================================
    // Invite New User
    // ===========================================

    app.post('/api/crm/:appId/users/invite', async (c) => {
        const { appId } = c.req.param();
        const { email, name, role, password } = await c.req.json<{
            email: string;
            name: string;
            role: 'admin' | 'member' | 'viewer';
            password: string;
        }>();

        if (!email || !name || !password) {
            return bad(c, 'Email, name, and password are required');
        }

        // Check if email already exists in this CRM
        const existing = await CrmUserEntity.getByEmail(c.env, appId, email);
        if (existing) {
            return bad(c, 'User with this email already exists');
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const user = await CrmUserEntity.create(c.env, {
            id: crypto.randomUUID(),
            appId,
            email,
            name,
            passwordHash,
            role: role || 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS[role || 'member'],
            isActive: true,
        });

        return ok(c, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    });

    // ===========================================
    // List CRM Users
    // ===========================================

    app.get('/api/crm/:appId/users', async (c) => {
        const { appId } = c.req.param();
        const users = await CrmUserEntity.getByAppId(c.env, appId);

        return ok(c, {
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                avatarUrl: u.avatarUrl,
                isActive: u.isActive,
                lastLoginAt: u.lastLoginAt,
                createdAt: u.createdAt,
            })),
        });
    });

    // ===========================================
    // Update CRM User
    // ===========================================

    app.put('/api/crm/:appId/users/:userId', async (c) => {
        const { userId } = c.req.param();
        const body = await c.req.json<{
            name?: string;
            role?: 'admin' | 'member' | 'viewer';
            isActive?: boolean;
        }>();

        const updates: Parameters<typeof CrmUserEntity.update>[2] = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.role !== undefined) {
            updates.role = body.role;
            updates.permissions = DEFAULT_ROLE_PERMISSIONS[body.role];
        }
        if (body.isActive !== undefined) updates.isActive = body.isActive;

        const success = await CrmUserEntity.update(c.env, userId, updates);
        if (!success) {
            return notFound(c, 'User not found');
        }

        const updated = await CrmUserEntity.getById(c.env, userId);
        return ok(c, { user: updated });
    });

    // ===========================================
    // Delete CRM User
    // ===========================================

    app.delete('/api/crm/:appId/users/:userId', async (c) => {
        const { userId } = c.req.param();

        // Delete sessions first
        await CrmSessionEntity.deleteByUserId(c.env, userId);

        // Delete user
        const success = await CrmUserEntity.delete(c.env, userId);

        return ok(c, { deleted: success });
    });

    // ===========================================
    // Change Password
    // ===========================================

    app.post('/api/crm/:appId/auth/change-password', async (c) => {
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return c.json({ success: false, error: 'No token provided' }, 401);
        }

        const session = await CrmSessionEntity.getByToken(c.env, token);
        if (!session) {
            return c.json({ success: false, error: 'Invalid token' }, 401);
        }

        const { currentPassword, newPassword } = await c.req.json<{
            currentPassword: string;
            newPassword: string;
        }>();

        if (!currentPassword || !newPassword) {
            return bad(c, 'Current and new password are required');
        }

        if (newPassword.length < 6) {
            return bad(c, 'New password must be at least 6 characters');
        }

        // Get user with password
        const user = await CrmUserEntity.getById(c.env, session.userId);
        if (!user) {
            return notFound(c, 'User not found');
        }

        // Get password hash (need to query again with email)
        const userWithPassword = await CrmUserEntity.getByEmail(c.env, user.appId, user.email);
        if (!userWithPassword) {
            return notFound(c, 'User not found');
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, userWithPassword.passwordHash);
        if (!isValid) {
            return bad(c, 'Current password is incorrect');
        }

        // Update password
        const newHash = await hashPassword(newPassword);
        await CrmUserEntity.update(c.env, user.id, { passwordHash: newHash });

        return ok(c, { success: true });
    });
}
