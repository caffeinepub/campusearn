import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, DollarSign, Tag } from 'lucide-react';
import { Task, TaskStatus, UserAppRole } from '../../backend';
import StatusBadge from './StatusBadge';
import PostedByLabel from './PostedByLabel';
import { useNavigate } from '@tanstack/react-router';
import { useAcceptTask, useGetUserAppRole } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { formatInr } from '../../utils/formatInr';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: appRole } = useGetUserAppRole();
  const { mutate: acceptTask, isPending: isAccepting } = useAcceptTask();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isTaskProvider = task.provider.toText() === currentUserPrincipal;
  const isStudent = appRole === UserAppRole.student;
  const showAcceptButton = isStudent && task.status === TaskStatus.open && !isTaskProvider;

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleCardClick = () => {
    navigate({ to: '/tasks/$taskId', params: { taskId: task.id } });
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Accept this task?')) {
      acceptTask({ taskId: task.id }, {
        onSuccess: () => {
          navigate({ to: '/student/tasks' });
        }
      });
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
          <StatusBadge status={task.status} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {task.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateDescription(task.description, 100)}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="text-xl font-bold text-primary">{formatInr(task.paymentAmount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{task.location}</span>
          </div>

          <PostedByLabel providerId={task.provider.toText()} />
        </div>

        {showAcceptButton && (
          <Button 
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full"
            size="sm"
          >
            {isAccepting ? 'Accepting...' : 'Accept Task'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
