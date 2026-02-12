import { useGetUserProfile } from '../../hooks/useQueries';
import { User } from 'lucide-react';

interface PostedByLabelProps {
  providerId: string;
}

export default function PostedByLabel({ providerId }: PostedByLabelProps) {
  const { data: profile, isLoading } = useGetUserProfile(providerId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const displayName = profile?.name || `${providerId.slice(0, 8)}...`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <User className="h-4 w-4" />
      <span>Posted by <span className="font-medium text-foreground">{displayName}</span></span>
    </div>
  );
}
