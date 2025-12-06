-- AppChahiye D1 Database Schema
-- Run with: npx wrangler d1 execute appchahiye-db --remote --file=./worker/schema.sql

-- Users table (admins and clients)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  notification_prefs TEXT DEFAULT '{"projectUpdates":true,"newMessages":true}'
);

-- Clients table (business profiles linked to users)
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  project_type TEXT,
  portal_url TEXT DEFAULT '/portal/:clientId',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  deadline INTEGER,
  notes TEXT DEFAULT '',
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'completed')),
  due_date INTEGER,
  files TEXT DEFAULT '[]',
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid')),
  pdf_url TEXT,
  issued_at INTEGER NOT NULL,
  service_ids TEXT DEFAULT '[]',
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Messages table (chat system)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL
);

-- Form submissions table (contact form)
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT DEFAULT '',
  project_description TEXT DEFAULT '',
  features TEXT DEFAULT '',
  submitted_at INTEGER NOT NULL
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK(type IN ('one-time', 'recurring')),
  price REAL NOT NULL
);

-- Website content table (singleton for CMS)
CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  content TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
