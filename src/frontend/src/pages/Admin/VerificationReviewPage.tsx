import { useGetPendingVerifications, useVerifyUser } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function VerificationReviewPage() {
  const { data: verifications = [], isLoading } = useGetPendingVerifications();
  const verifyMutation = useVerifyUser();

  const handleApprove = (userId: string) => {
    verifyMutation.mutate({ userId, approve: true });
  };

  const handleReject = (userId: string) => {
    verifyMutation.mutate({ userId, approve: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Verifications</h1>
        <p className="text-muted-foreground">Review and approve student verification requests</p>
      </div>

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No pending verifications</p>
            <p className="text-sm text-muted-foreground">All verification requests have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {verifications.map((verification) => (
            <Card key={verification.user.toText()}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">Verification Request</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      User ID: {verification.user.toText().slice(0, 20)}...
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">College ID Document:</p>
                  <a
                    href={verification.verificationDocument.getDirectURL()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(verification.user.toText())}
                    disabled={verifyMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(verification.user.toText())}
                    disabled={verifyMutation.isPending}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
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
