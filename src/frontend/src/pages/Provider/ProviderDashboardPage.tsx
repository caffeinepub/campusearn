import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useGetDepositBalance, useGetTasksByUser, useDepositToWallet, useGetTransactionHistory } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import TaskCard from '../../components/tasks/TaskCard';
import TransactionHistoryTable from '../../components/transactions/TransactionHistoryTable';
import { Wallet, Briefcase, CheckCircle, DollarSign, Loader2, Plus } from 'lucide-react';
import { TaskStatus } from '../../backend';
import { useNavigate } from '@tanstack/react-router';
import { formatInr } from '../../utils/formatInr';

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: depositBalance, isLoading: balanceLoading } = useGetDepositBalance();
  const { data: tasks, isLoading: tasksLoading } = useGetTasksByUser(identity?.getPrincipal().toString());
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactionHistory();
  const { mutate: deposit, isPending: isDepositing } = useDepositToWallet();

  const [depositAmount, setDepositAmount] = useState('');

  const activeTasks = tasks?.filter(
    (task) =>
      task.status === TaskStatus.inProgress ||
      task.status === TaskStatus.proofSubmitted ||
      task.status === TaskStatus.underReview
  ) || [];

  const completedTasks = tasks?.filter((task) => task.status === TaskStatus.completed) || [];

  const totalSpent = tasks?.reduce((sum, task) => sum + Number(task.paymentAmount), 0) || 0;

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (amount > 0) {
      deposit({ amount }, {
        onSuccess: () => {
          setDepositAmount('');
        }
      });
    }
  };

  const stats = [
    {
      title: 'Deposit Balance',
      value: formatInr(depositBalance || BigInt(0)),
      icon: Wallet,
      description: 'Available for tasks',
      loading: balanceLoading,
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
      title: 'Total Spent',
      value: formatInr(totalSpent),
      icon: DollarSign,
      description: 'Lifetime spending',
      loading: tasksLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your tasks and deposits</p>
        </div>
        <Button onClick={() => navigate({ to: '/provider/create-task' })}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>Add funds to your account to create tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="depositAmount">Amount (₹)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseInt(depositAmount) <= 0}
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Depositing...
                  </>
                ) : (
                  'Deposit'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Posted Tasks</CardTitle>
          <CardDescription>Tasks you have created</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any tasks yet</p>
              <Button onClick={() => navigate({ to: '/provider/create-task' })}>
                Create Your First Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TransactionHistoryTable transactions={transactions || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
