import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useGetCallerUserProfile, useGetWalletBalance, useGetUserAppRole, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { formatInr } from '../../utils/formatInr';

export default function StudentProfilePage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: walletBalance, isLoading: walletLoading } = useGetWalletBalance();
  const { data: appRole, isLoading: roleLoading } = useGetUserAppRole();
  const { mutate: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setEmail('');
    }
  }, [userProfile]);

  const handleSave = () => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      name,
      phoneNumber,
    };

    saveProfile(updatedProfile);
  };

  if (profileLoading || walletLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleLabel = () => {
    if (!appRole) return 'Unknown';
    switch (appRole) {
      case 'student':
        return 'Student';
      case 'taskPoster':
        return 'Task Poster';
      case 'business':
        return 'Business';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Wallet Balance</Label>
            <Input
              value={formatInr(walletBalance || BigInt(0))}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={getRoleLabel()}
              disabled
              className="bg-muted"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !phoneNumber.trim()}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
