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
import FilledFormsPage from './pages/admin/FilledFormsPage';
import ServicesPage from './pages/admin/ServicesPage';
import ClientServicesPage from './pages/portal/ClientServicesPage';
import DemoAppPage from './pages/demo-app/DemoAppPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/experience-demo/*",
    element: <DemoAppPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/login",
    element: <AdminLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna",
    element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/content",
    element: <ProtectedRoute><ContentManagerPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/leads",
    element: <ProtectedRoute><LeadsClientsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/clients/:clientId/projects",
    element: <ProtectedRoute><ClientProjectsPageAdmin /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/invoices",
    element: <ProtectedRoute><AdminInvoicesPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/services",
    element: <ProtectedRoute><ServicesPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/chat",
    element: <ProtectedRoute><AdminChatPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/forms",
    element: <ProtectedRoute><FilledFormsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/analytics",
    element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/yenahimilna/settings",
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
    path: "/portal/:clientId/services",
    element: <ClientServicesPage />,
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