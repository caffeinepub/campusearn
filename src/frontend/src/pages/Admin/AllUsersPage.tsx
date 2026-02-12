import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useGetUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';

export default function AllUsersPage() {
  const { data: userRole } = useGetUserRole();
  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can view all users</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to access this page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">All Users</h1>
        <p className="text-muted-foreground">Manage and view all registered users</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">User Management</p>
          <p className="text-sm text-muted-foreground">
            User listing and management features will be available here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
