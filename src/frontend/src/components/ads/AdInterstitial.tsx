import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useGetAdPlacement } from '../../hooks/useQueries';
import { AdType } from '../../backend';
import { useState, useEffect } from 'react';

interface AdInterstitialProps {
  show: boolean;
  onClose: () => void;
}

export default function AdInterstitial({ show, onClose }: AdInterstitialProps) {
  const { data: adPlacement } = useGetAdPlacement(AdType.taskCompletionInterstitial);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [show, countdown]);

  useEffect(() => {
    if (show) {
      setCountdown(3);
    }
  }, [show]);

  if (!adPlacement) {
    return null;
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Great Work!</DialogTitle>
          <DialogDescription>
            {adPlacement.content}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} disabled={countdown > 0}>
            {countdown > 0 ? `Continue (${countdown})` : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
