import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useCreateTask, useGetDepositBalance, useGetUserAppRole } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UserAppRole } from '../../backend';
import { formatInr } from '../../utils/formatInr';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { data: depositBalance, isLoading: balanceLoading } = useGetDepositBalance();
  const { data: appRole } = useGetUserAppRole();
  const { mutate: createTask, isPending } = useCreateTask();

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [timeRequired, setTimeRequired] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [proofRequired, setProofRequired] = useState<'yes' | 'no'>('yes');

  const isProvider = appRole === UserAppRole.taskPoster || appRole === UserAppRole.business;

  if (!isProvider) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-4">Only Task Posters and Businesses can create tasks.</p>
            <Button onClick={() => navigate({ to: '/student/dashboard' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payment = parseInt(paymentAmount);
    const balance = Number(depositBalance || BigInt(0));

    if (payment > balance) {
      return;
    }

    createTask(
      {
        title,
        description: fullDescription,
        category,
        location,
        timeRequired,
        paymentAmount: BigInt(payment),
      },
      {
        onSuccess: () => {
          navigate({ to: '/provider/dashboard' });
        },
      }
    );
  };

  const payment = parseInt(paymentAmount) || 0;
  const balance = Number(depositBalance || BigInt(0));
  const insufficientBalance = payment > balance;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Task</h1>
        <p className="text-muted-foreground">Post a new task for students to complete</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Balance</CardTitle>
          <CardDescription>Your available balance for creating tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <p className="text-3xl font-bold text-primary">{formatInr(depositBalance || BigInt(0))}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Fill in the information about your task</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief description (shown in task cards)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Full Description *</Label>
              <Textarea
                id="fullDescription"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detailed description of the task"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Promotion, Survey"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Any, Campus"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeRequired">Time Required *</Label>
                <Input
                  id="timeRequired"
                  value={timeRequired}
                  onChange={(e) => setTimeRequired(e.target.value)}
                  placeholder="e.g., 30 minutes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment (₹) *</Label>
                <Input
                  id="payment"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount in ₹"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofRequired">Proof Required *</Label>
              <Select value={proofRequired} onValueChange={(v) => setProofRequired(v as 'yes' | 'no')}>
                <SelectTrigger id="proofRequired">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {insufficientBalance && paymentAmount && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. You have {formatInr(depositBalance || BigInt(0))} but need {formatInr(payment)}.
                  Please deposit more funds before creating this task.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isPending || insufficientBalance || !title || !fullDescription || !category || !location || !timeRequired || !paymentAmount}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
