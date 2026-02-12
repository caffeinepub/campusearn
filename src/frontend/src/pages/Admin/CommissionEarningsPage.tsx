import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useGetUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';

export default function CommissionEarningsPage() {
  const { data: userRole } = useGetUserRole();
  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can view commission earnings</CardDescription>
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
        <h1 className="text-3xl font-bold mb-2">Commission Earnings</h1>
        <p className="text-muted-foreground">Track platform commission from completed tasks</p>
      </div>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          The platform earns 10% commission on every completed task payment.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Commission Tracking</p>
          <p className="text-sm text-muted-foreground">
            Detailed commission earnings and analytics will be available here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
