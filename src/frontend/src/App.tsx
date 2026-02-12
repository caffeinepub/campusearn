import { RouterProvider, createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetUserRole } from './hooks/useQueries';
import AuthLandingPage from './pages/Auth/AuthLandingPage';
import StudentDashboardPage from './pages/Student/StudentDashboardPage';
import StudentProfilePage from './pages/Student/StudentProfilePage';
import MyTasksPage from './pages/Student/MyTasksPage';
import WalletPage from './pages/Student/WalletPage';
import TransactionHistoryPage from './pages/Student/TransactionHistoryPage';
import ProviderDashboardPage from './pages/Provider/ProviderDashboardPage';
import CreateTaskPage from './pages/Provider/CreateTaskPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import VerificationReviewPage from './pages/Admin/VerificationReviewPage';
import TaskModerationPage from './pages/Admin/TaskModerationPage';
import TaskCompletionPage from './pages/Admin/TaskCompletionPage';
import WithdrawalRequestsPage from './pages/Admin/WithdrawalRequestsPage';
import ActivityLogsPage from './pages/Admin/ActivityLogsPage';
import AllUsersPage from './pages/Admin/AllUsersPage';
import CommissionEarningsPage from './pages/Admin/CommissionEarningsPage';
import SystemStatsPage from './pages/Admin/SystemStatsPage';
import AdsSettingsPage from './pages/Admin/AdsSettingsPage';
import TaskDetailsPage from './pages/Tasks/TaskDetailsPage';
import AppShell from './components/layout/AppShell';
import { Toaster } from './components/ui/sonner';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetUserRole();

  if (!identity) {
    return <AuthLandingPage />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell />
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    throw redirect({ to: '/student/dashboard' });
  }
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/dashboard',
  component: StudentDashboardPage
});

const studentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/profile',
  component: StudentProfilePage
});

const myTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/tasks',
  component: MyTasksPage
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/wallet',
  component: WalletPage
});

const transactionHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/transactions',
  component: TransactionHistoryPage
});

const providerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provider/dashboard',
  component: ProviderDashboardPage
});

const createTaskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provider/create-task',
  component: CreateTaskPage
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage
});

const verificationReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/verifications',
  component: VerificationReviewPage
});

const taskModerationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tasks',
  component: TaskModerationPage
});

const taskCompletionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/completions',
  component: TaskCompletionPage
});

const withdrawalRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/withdrawals',
  component: WithdrawalRequestsPage
});

const activityLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/activity-logs',
  component: ActivityLogsPage
});

const allUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AllUsersPage
});

const commissionEarningsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/commission',
  component: CommissionEarningsPage
});

const systemStatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/stats',
  component: SystemStatsPage
});

const adsSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/ads',
  component: AdsSettingsPage
});

const taskDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks/$taskId',
  component: TaskDetailsPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  studentDashboardRoute,
  studentProfileRoute,
  myTasksRoute,
  walletRoute,
  transactionHistoryRoute,
  providerDashboardRoute,
  createTaskRoute,
  adminDashboardRoute,
  verificationReviewRoute,
  taskModerationRoute,
  taskCompletionRoute,
  withdrawalRequestsRoute,
  activityLogsRoute,
  allUsersRoute,
  commissionEarningsRoute,
  systemStatsRoute,
  adsSettingsRoute,
  taskDetailsRoute
]);

const router = createRouter({ 
  routeTree,
  basepath: import.meta.env.BASE_URL || '/'
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
