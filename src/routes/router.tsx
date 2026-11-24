/**
 * Application routing.
 *
 * - Public routes are lazy-loaded per area so the initial bundle stays small.
 * - Protected areas own their guard inside the layout component
 *   (`DashboardLayout` → RequireAuth, `AdminLayout` → RequireAdmin), which keeps
 *   the route table declarative and avoids double-rendering shells.
 * - Client-side guards are UX only; the backend remains the authority.
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RouteError } from '@/routes/RouteError';
import { RootProviders } from '@/routes/RootProviders';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootProviders>
        <PublicLayout />
      </RootProviders>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/public/HomePage')).default }) },
      { path: 'services', lazy: async () => ({ Component: (await import('@/pages/public/ServiceCataloguePage')).default }) },
      { path: 'services/:slug', lazy: async () => ({ Component: (await import('@/pages/public/ServiceDetailPage')).default }) },
      { path: 'assistant', lazy: async () => ({ Component: (await import('@/pages/public/AssistantPage')).default }) },
      { path: 'applications', lazy: async () => ({ Component: (await import('@/pages/public/ApplicationGeneratorPage')).default }) },
      { path: 'readiness', lazy: async () => ({ Component: (await import('@/pages/public/ReadinessPage')).default }) },
      { path: 'scam-detector', lazy: async () => ({ Component: (await import('@/pages/public/ScamDetectorPage')).default }) },
      { path: 'complaints', lazy: async () => ({ Component: (await import('@/pages/public/ComplaintAssistantPage')).default }) },
      { path: 'documents', lazy: async () => ({ Component: (await import('@/pages/public/DocumentAnalyzerPage')).default }) },
      { path: 'welfare', lazy: async () => ({ Component: (await import('@/pages/public/WelfarePage')).default }) },
      { path: 'emergency', lazy: async () => ({ Component: (await import('@/pages/public/EmergencyPage')).default }) },
      { path: 'offices', lazy: async () => ({ Component: (await import('@/pages/public/OfficeFinderPage')).default }) },
      { path: 'legal', lazy: async () => ({ Component: (await import('@/pages/public/LegalPage')).default }) },
      { path: 'legal/:slug', lazy: async () => ({ Component: (await import('@/pages/public/LegalArticlePage')).default }) },
      { path: 'lawyers', lazy: async () => ({ Component: (await import('@/pages/public/LawyerDirectoryPage')).default }) },
      { path: 'about', lazy: async () => ({ Component: (await import('@/pages/public/AboutPage')).default }) },
      { path: 'feedback', lazy: async () => ({ Component: (await import('@/pages/public/FeedbackPage')).default }) },
      { path: 'login', lazy: async () => ({ Component: (await import('@/pages/auth/LoginPage')).default }) },
      { path: 'register', lazy: async () => ({ Component: (await import('@/pages/auth/RegisterPage')).default }) },
      { path: 'forgot-password', lazy: async () => ({ Component: (await import('@/pages/auth/ForgotPasswordPage')).default }) },
      { path: 'forbidden', lazy: async () => ({ Component: (await import('@/pages/system/ForbiddenPage')).default }) },

      // Citizen area — guard lives inside the layout
      {
        path: 'dashboard',
        lazy: async () => ({ Component: (await import('@/pages/citizen/DashboardLayout')).default }),
        children: [
          { index: true, lazy: async () => ({ Component: (await import('@/pages/citizen/DashboardHomePage')).default }) },
          { path: 'drafts', lazy: async () => ({ Component: (await import('@/pages/citizen/DraftsPage')).default }) },
          { path: 'saved-services', lazy: async () => ({ Component: (await import('@/pages/citizen/SavedServicesPage')).default }) },
          { path: 'history', lazy: async () => ({ Component: (await import('@/pages/citizen/HistoryPage')).default }) },
        ],
      },
      { path: 'profile', lazy: async () => ({ Component: (await import('@/pages/citizen/ProfilePage')).default }) },
      { path: 'settings', element: <Navigate to="/profile" replace /> },

      // Admin area — its own guard, layout and sidebar
      {
        path: 'admin',
        lazy: async () => ({ Component: (await import('@/pages/admin/AdminLayout')).default }),
        children: [
          { index: true, lazy: async () => ({ Component: (await import('@/pages/admin/AdminDashboardPage')).default }) },
          { path: 'services', lazy: async () => ({ Component: (await import('@/pages/admin/AdminServicesPage')).default }) },
          { path: 'services/:id', lazy: async () => ({ Component: (await import('@/pages/admin/AdminServiceEditPage')).default }) },
          { path: 'requirements', lazy: async () => ({ Component: (await import('@/pages/admin/AdminRequirementsPage')).default }) },
          { path: 'procedures', lazy: async () => ({ Component: (await import('@/pages/admin/AdminProceduresPage')).default }) },
          { path: 'sources', lazy: async () => ({ Component: (await import('@/pages/admin/AdminSourcesPage')).default }) },
          { path: 'knowledge-base', lazy: async () => ({ Component: (await import('@/pages/admin/AdminKnowledgeBasePage')).default }) },
          { path: 'welfare', lazy: async () => ({ Component: (await import('@/pages/admin/AdminWelfarePage')).default }) },
          { path: 'emergency', lazy: async () => ({ Component: (await import('@/pages/admin/AdminEmergencyPage')).default }) },
          { path: 'offices', lazy: async () => ({ Component: (await import('@/pages/admin/AdminOfficesPage')).default }) },
          { path: 'lawyers', lazy: async () => ({ Component: (await import('@/pages/admin/AdminLawyersPage')).default }) },
          { path: 'users', lazy: async () => ({ Component: (await import('@/pages/admin/AdminUsersPage')).default }) },
          { path: 'feedback', lazy: async () => ({ Component: (await import('@/pages/admin/AdminFeedbackPage')).default }) },
          { path: 'audit-logs', lazy: async () => ({ Component: (await import('@/pages/admin/AdminAuditLogsPage')).default }) },
          { path: 'settings', lazy: async () => ({ Component: (await import('@/pages/admin/AdminSettingsPage')).default }) },
        ],
      },

      { path: '*', lazy: async () => ({ Component: (await import('@/pages/system/NotFoundPage')).default }) },
    ],
  },
]);
