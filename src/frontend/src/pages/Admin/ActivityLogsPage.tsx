import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useGetActivityLog, useGetUserRole } from '../../hooks/useQueries';
import { ActivityAction, UserRole } from '../../backend';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';

export default function ActivityLogsPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetUserRole();
  const { data: activityLog, isLoading } = useGetActivityLog();

  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-4">Only admins can view activity logs.</p>
            <Button onClick={() => navigate({ to: '/admin/dashboard' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: ActivityAction) => {
    switch (action) {
      case ActivityAction.taskCreated:
        return 'Task Created';
      case ActivityAction.taskAccepted:
        return 'Task Accepted';
      case ActivityAction.proofUploaded:
        return 'Proof Uploaded';
      case ActivityAction.taskApproved:
        return 'Task Approved';
      case ActivityAction.taskRejected:
        return 'Task Rejected';
      case ActivityAction.walletCredited:
        return 'Wallet Credited';
      case ActivityAction.walletDebited:
        return 'Wallet Debited';
      case ActivityAction.withdrawalRequested:
        return 'Withdrawal Requested';
      case ActivityAction.withdrawalApproved:
        return 'Withdrawal Approved';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">View all system activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Activity</CardTitle>
          <CardDescription>Complete log of all actions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activityLog && activityLog.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Related Task</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLog.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDate(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getActionLabel(entry.action)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.user.toText().substring(0, 12)}...
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.relatedTask || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No activity logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
