import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useRegister, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { UserAppRole } from '../../backend';

function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path}`.replace(/\/+/g, '/');
}

export default function AuthLandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: register, isPending: isRegistering } = useRegister();
  const [selectedRole, setSelectedRole] = useState<'student' | 'taskPoster' | 'business'>('student');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = () => {
    let appRole: UserAppRole;
    if (selectedRole === 'student') {
      appRole = UserAppRole.student;
    } else if (selectedRole === 'business') {
      appRole = UserAppRole.business;
    } else {
      appRole = UserAppRole.taskPoster;
    }
    register({ name, phoneNumber, appRole });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <img 
              src={getAssetUrl('assets/generated/campusearn-logo.dim_512x512.png')} 
              alt="CampusEarn" 
              className="h-20 w-20 mx-auto" 
            />
            <img
              src={getAssetUrl('assets/generated/campusearn-wordmark.dim_1200x300.png')}
              alt="CampusEarn"
              className="h-10 mx-auto"
            />
            <p className="text-xl text-muted-foreground">Earn Between Classes</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome to CampusEarn</CardTitle>
              <CardDescription>
                Connect with Internet Identity to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogin}
                disabled={loginStatus === 'logging-in'}
                className="w-full"
                size="lg"
              >
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Login with Internet Identity'}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Secure authentication powered by Internet Computer</p>
          </div>
        </div>
      </div>

      <Dialog open={showProfileSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Choose your role and provide your details to get started
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'student' | 'taskPoster' | 'business')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="taskPoster">Task Poster</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                As a Student, you can accept and complete tasks to earn money.
              </p>
            </TabsContent>

            <TabsContent value="taskPoster" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                As a Task Poster, you can create tasks and hire students to complete them.
              </p>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                As a Business, you can create campaigns and track task completion stats.
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={!name.trim() || !phoneNumber.trim() || isRegistering}
              className="w-full"
            >
              {isRegistering ? 'Creating Profile...' : 'Complete Registration'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t py-6">
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
