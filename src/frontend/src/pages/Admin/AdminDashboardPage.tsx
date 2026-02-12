import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGetAllTasks, useGetPendingVerifications, useGetPendingWithdrawals } from '../../hooks/useQueries';
import { Shield, Users, ClipboardList, CheckCircle, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { TaskStatus } from '../../backend';

export default function AdminDashboardPage() {
  const { data: allTasks } = useGetAllTasks();
  const { data: pendingVerifications } = useGetPendingVerifications();
  const { data: pendingWithdrawals } = useGetPendingWithdrawals();

  const pendingApprovalTasks = allTasks?.filter(task => task.status === TaskStatus.pendingApproval) || [];
  const ongoingTasks = allTasks?.filter(task => task.status === TaskStatus.inProgress || task.status === TaskStatus.proofSubmitted) || [];
  const completedTasks = allTasks?.filter(task => task.status === TaskStatus.completed) || [];
  
  const totalCommission = completedTasks.reduce((sum, task) => {
    return sum + (Number(task.paymentAmount) * 0.1);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage platform operations and approvals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerifications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Users awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks to Review</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Ongoing tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earnings</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">Total earned (10%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/verifications">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Review Verifications
                </CardTitle>
                <CardDescription>
                  {pendingVerifications?.length || 0} pending verification{(pendingVerifications?.length || 0) !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  View Requests
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/completions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Complete Tasks
                </CardTitle>
                <CardDescription>
                  {ongoingTasks.length} ongoing task{ongoingTasks.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Review Tasks
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/withdrawals">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Withdrawal Requests
                </CardTitle>
                <CardDescription>
                  {pendingWithdrawals?.length || 0} pending request{(pendingWithdrawals?.length || 0) !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Process Requests
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/activity-logs">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Logs
                </CardTitle>
                <CardDescription>
                  Monitor system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/tasks">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  All Tasks
                </CardTitle>
                <CardDescription>
                  {allTasks?.length || 0} total task{(allTasks?.length || 0) !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/stats">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Stats
                </CardTitle>
                <CardDescription>
                  Platform analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  View Stats
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
