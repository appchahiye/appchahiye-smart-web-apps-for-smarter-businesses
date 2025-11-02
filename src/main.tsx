import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import ClientDashboardPage from '@/pages/portal/ClientDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ContentManagerPage from './pages/admin/ContentManagerPage';
import LeadsClientsPage from './pages/admin/LeadsClientsPage';
import ClientProjectsPageAdmin from './pages/admin/ClientProjectsPage';
import ClientProjectsPage from './pages/portal/ClientProjectsPage';
import AdminInvoicesPage from './pages/admin/InvoicesPage';
import ClientInvoicesPage from './pages/portal/ClientInvoicesPage';
import AdminChatPage from './pages/admin/ChatPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ClientFilesPage from './pages/portal/ClientFilesPage';
import ClientAccountPage from './pages/portal/ClientAccountPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/content",
    element: <ProtectedRoute><ContentManagerPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/leads",
    element: <ProtectedRoute><LeadsClientsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/clients/:clientId/projects",
    element: <ProtectedRoute><ClientProjectsPageAdmin /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/invoices",
    element: <ProtectedRoute><AdminInvoicesPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/chat",
    element: <ProtectedRoute><AdminChatPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/analytics",
    element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/settings",
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/login",
    element: <ClientLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/:clientId",
    element: <ClientDashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/:clientId/projects",
    element: <ClientProjectsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/:clientId/invoices",
    element: <ClientInvoicesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/:clientId/files",
    element: <ClientFilesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal/:clientId/account",
    element: <ClientAccountPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)