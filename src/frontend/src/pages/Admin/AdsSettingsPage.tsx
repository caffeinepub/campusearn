import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useGetAdPlacements, useUpdateAdPlacement, useGetUserRole } from '../../hooks/useQueries';
import { AdType, UserRole } from '../../backend';
import { Loader2, Megaphone } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdsSettingsPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetUserRole();
  const { data: adPlacements, isLoading } = useGetAdPlacements();
  const { mutate: updateAd, isPending } = useUpdateAdPlacement();

  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [frequency, setFrequency] = useState('');

  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-4">Only admins can access ads settings.</p>
            <Button onClick={() => navigate({ to: '/admin/dashboard' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (ad: any) => {
    setEditingAd(ad.id);
    setContent(ad.content);
    setFrequency(ad.frequency.toString());
  };

  const handleSave = (adType: AdType, adId: string) => {
    updateAd({
      adType,
      newAd: {
        id: adId,
        adType,
        content,
        frequency: BigInt(parseInt(frequency) || 1),
      },
    }, {
      onSuccess: () => {
        setEditingAd(null);
        setContent('');
        setFrequency('');
      }
    });
  };

  const getAdTypeLabel = (adType: AdType) => {
    switch (adType) {
      case AdType.dashboardBanner:
        return 'Dashboard Banner';
      case AdType.taskBanner:
        return 'Task Details Banner';
      case AdType.taskCompletionInterstitial:
        return 'Task Completion Interstitial';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-8 w-8" />
          Ads Settings
        </h1>
        <p className="text-muted-foreground">Manage ad placements and frequency</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {adPlacements && adPlacements.length > 0 ? (
            adPlacements.map((ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <CardTitle>{getAdTypeLabel(ad.adType)}</CardTitle>
                  <CardDescription>Configure this ad placement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingAd === ad.id ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`content-${ad.id}`}>Content</Label>
                        <Textarea
                          id={`content-${ad.id}`}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`frequency-${ad.id}`}>Frequency</Label>
                        <Input
                          id={`frequency-${ad.id}`}
                          type="number"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Show every N completions (for interstitials)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave(ad.adType, ad.id)}
                          disabled={isPending}
                        >
                          {isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingAd(null);
                            setContent('');
                            setFrequency('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium mb-1">Content:</p>
                        <p className="text-sm text-muted-foreground">{ad.content}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Frequency:</p>
                        <p className="text-sm text-muted-foreground">{ad.frequency.toString()}</p>
                      </div>
                      <Button onClick={() => handleEdit(ad)}>Edit</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No ad placements configured yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
