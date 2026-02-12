import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useGetOpenTasks, useGetWalletBalance } from '../../hooks/useQueries';
import TaskCard from '../../components/tasks/TaskCard';
import AdPlacementBanner from '../../components/ads/AdPlacementBanner';
import { Wallet, Briefcase, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { TaskStatus, AdType } from '../../backend';
import { formatInr } from '../../utils/formatInr';

export default function StudentDashboardPage() {
  const { data: openTasks, isLoading: tasksLoading } = useGetOpenTasks();
  const { data: walletBalance, isLoading: walletLoading } = useGetWalletBalance();

  const activeTasks = openTasks?.filter(
    (task) =>
      task.status === TaskStatus.inProgress ||
      task.status === TaskStatus.proofSubmitted ||
      task.status === TaskStatus.underReview
  ) || [];

  const completedTasks = openTasks?.filter((task) => task.status === TaskStatus.completed) || [];

  const totalEarnings = walletBalance || BigInt(0);

  const stats = [
    {
      title: 'Wallet Balance',
      value: formatInr(walletBalance || BigInt(0)),
      icon: Wallet,
      description: 'Available balance',
      loading: walletLoading,
    },
    {
      title: 'Active Tasks',
      value: activeTasks.length.toString(),
      icon: Briefcase,
      description: 'Tasks in progress',
      loading: tasksLoading,
    },
    {
      title: 'Completed Tasks',
      value: completedTasks.length.toString(),
      icon: CheckCircle,
      description: 'Successfully completed',
      loading: tasksLoading,
    },
    {
      title: 'Total Earnings',
      value: formatInr(totalEarnings),
      icon: DollarSign,
      description: 'Lifetime earnings',
      loading: walletLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here are your available tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdPlacementBanner adType={AdType.dashboardBanner} />

      <Card>
        <CardHeader>
          <CardTitle>Available Tasks</CardTitle>
          <CardDescription>Browse and accept tasks to start earning</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : openTasks && openTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks available. Be the first to post a task.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
