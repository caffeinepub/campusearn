import { Card, CardContent } from '../ui/card';
import { useGetAdPlacement } from '../../hooks/useQueries';
import { AdType } from '../../backend';
import { AlertCircle } from 'lucide-react';

interface AdPlacementBannerProps {
  adType: AdType;
  className?: string;
}

export default function AdPlacementBanner({ adType, className = '' }: AdPlacementBannerProps) {
  const { data: adPlacement, isLoading } = useGetAdPlacement(adType);

  if (isLoading) {
    return null;
  }

  if (!adPlacement) {
    return null;
  }

  return (
    <Card className={`bg-accent/20 border-accent ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-accent-foreground">{adPlacement.content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
