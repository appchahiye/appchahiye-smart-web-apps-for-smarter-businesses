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
    element: <AdminDashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  // Add more admin routes here as needed
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
  // Add more client portal routes here as needed
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)