import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGetAllTasks, useReviewTask } from '../../hooks/useQueries';
import { TaskStatus } from '../../backend';
import { CheckCircle, User, DollarSign, Clock, MapPin, XCircle } from 'lucide-react';
import StatusBadge from '../../components/tasks/StatusBadge';
import PostedByLabel from '../../components/tasks/PostedByLabel';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useNavigate } from '@tanstack/react-router';

export default function TaskCompletionPage() {
  const { data: allTasks, isLoading } = useGetAllTasks();
  const { mutate: reviewTask, isPending } = useReviewTask();
  const navigate = useNavigate();

  const tasksForReview = allTasks?.filter(task => task.status === TaskStatus.proofSubmitted) || [];

  const handleApprove = (taskId: string) => {
    if (confirm('Approve this task? This will distribute payment: 90% to student, 10% to admin.')) {
      reviewTask({ taskId, approve: true });
    }
  };

  const handleReject = (taskId: string) => {
    if (confirm('Reject this task? The student will be able to resubmit proof.')) {
      reviewTask({ taskId, approve: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Task Completion Review</h1>
        <p className="text-muted-foreground">Review submitted proofs and approve or reject tasks</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          When you approve a task, 90% of the payment goes to the student and 10% goes to the admin commission wallet.
        </AlertDescription>
      </Alert>

      {tasksForReview.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No tasks awaiting review</p>
            <p className="text-sm text-muted-foreground">Tasks with submitted proof will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasksForReview.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <p className="font-semibold">₹{Number(task.paymentAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium">{task.timeRequired}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{task.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Accepted By</p>
                      <p className="font-medium truncate">
                        {task.acceptedBy ? task.acceptedBy.toText().slice(0, 8) + '...' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <PostedByLabel providerId={task.provider.toText()} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => navigate({ to: '/tasks/$taskId', params: { taskId: task.id } })}
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleApprove(task.id)}
                    disabled={isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isPending ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReject(task.id)}
                    disabled={isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isPending ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
