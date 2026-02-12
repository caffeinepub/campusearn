import { Badge } from '../ui/badge';
import { TaskStatus } from '../../backend';

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.open:
        return { label: 'Open', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case TaskStatus.inProgress:
        return { label: 'In Progress', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
      case TaskStatus.proofSubmitted:
        return { label: 'Proof Submitted', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
      case TaskStatus.underReview:
        return { label: 'Under Review', className: 'bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100' };
      case TaskStatus.completed:
        return { label: 'Completed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case TaskStatus.rejected:
        return { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case TaskStatus.declined:
        return { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case TaskStatus.pendingApproval:
        return { label: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case TaskStatus.assigned:
        return { label: 'Assigned', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      default:
        return { label: 'Unknown', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
