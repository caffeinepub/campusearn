import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetUserRole, useGetUserAppRole, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Home, Briefcase, Plus, User, Wallet, History, Menu, LogOut, Shield, Users, DollarSign, BarChart3, FileText, CheckSquare, UserCheck, Activity, Megaphone } from 'lucide-react';
import { UserRole, UserAppRole } from '../../backend';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path}`.replace(/\/+/g, '/');
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const { data: userRole } = useGetUserRole();
  const { data: appRole } = useGetUserAppRole();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userRole === UserRole.admin;
  const isProvider = appRole === UserAppRole.taskPoster || appRole === UserAppRole.business;
  const isStudent = appRole === UserAppRole.student;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = isAdmin
    ? [
        { icon: Shield, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'All Users', path: '/admin/users' },
        { icon: Briefcase, label: 'All Tasks', path: '/admin/tasks' },
        { icon: CheckSquare, label: 'Task Completion', path: '/admin/completions' },
        { icon: UserCheck, label: 'Verifications', path: '/admin/verifications' },
        { icon: DollarSign, label: 'Withdrawals', path: '/admin/withdrawals' },
        { icon: Activity, label: 'Activity Logs', path: '/admin/activity-logs' },
        { icon: BarChart3, label: 'Commission', path: '/admin/commission' },
        { icon: FileText, label: 'System Stats', path: '/admin/stats' },
        { icon: Megaphone, label: 'Ads Settings', path: '/admin/ads' },
      ]
    : isProvider
    ? [
        { icon: Home, label: 'Dashboard', path: '/provider/dashboard' },
        { icon: Plus, label: 'Create Task', path: '/provider/create-task' },
      ]
    : [
        { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
        { icon: Briefcase, label: 'My Tasks', path: '/student/tasks' },
        { icon: Wallet, label: 'Wallet', path: '/student/wallet' },
        { icon: History, label: 'Transactions', path: '/student/transactions' },
        { icon: User, label: 'Profile', path: '/student/profile' },
      ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              navigate({ to: item.path as any });
              if (mobile) setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </>
  );

  const displayName = userProfile?.name || identity?.getPrincipal().toString().substring(0, 8) + '...';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <img
                      src={getAssetUrl('assets/generated/campusearn-wordmark.dim_1200x300.png')}
                      alt="CampusEarn"
                      className="h-8"
                    />
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    <NavLinks mobile />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <img
                src={getAssetUrl('assets/generated/campusearn-logo.dim_512x512.png')}
                alt="CampusEarn"
                className="h-8 w-8"
              />
              <img
                src={getAssetUrl('assets/generated/campusearn-wordmark.dim_1200x300.png')}
                alt="CampusEarn"
                className="h-6 hidden sm:block"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isAdmin && (
                <DropdownMenuItem onClick={() => navigate({ to: '/student/profile' as any })}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="hidden lg:flex w-64 border-r bg-muted/10">
          <nav className="flex-1 p-4 space-y-2">
            <NavLinks />
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="border-t py-6 bg-muted/10">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} CampusEarn. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
