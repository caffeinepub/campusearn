import { useGetAllTasks, useApproveTask } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, Clock, MapPin, DollarSign } from 'lucide-react';
import { TaskStatus } from '../../backend';

export default function TaskModerationPage() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const approveMutation = useApproveTask();

  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.pendingApproval);

  const handleApprove = (taskId: string) => {
    approveMutation.mutate({ taskId });
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
        <h1 className="text-3xl font-bold mb-2">Task Moderation</h1>
        <p className="text-muted-foreground">Review and approve tasks posted by providers</p>
      </div>

      {pendingTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No pending tasks</p>
            <p className="text-sm text-muted-foreground">All tasks have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <CardDescription className="line-clamp-3">{task.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span className="font-semibold text-foreground">₹{Number(task.paymentAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{task.timeRequired}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{task.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(task.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" disabled className="flex-1">
                    Reject (Coming Soon)
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
