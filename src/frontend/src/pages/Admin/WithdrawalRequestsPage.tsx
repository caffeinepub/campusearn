import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGetPendingWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '../../hooks/useQueries';
import { DollarSign, User, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { formatInr } from '../../utils/formatInr';

export default function WithdrawalRequestsPage() {
  const { data: withdrawals, isLoading } = useGetPendingWithdrawals();
  const { mutate: approve, isPending: isApproving } = useApproveWithdrawal();
  const { mutate: reject, isPending: isRejecting } = useRejectWithdrawal();

  const handleApprove = (requestId: string) => {
    if (confirm('Approve this withdrawal request? The amount will be deducted from the user\'s wallet.')) {
      approve({ requestId });
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('Reject this withdrawal request?')) {
      reject({ requestId });
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Review and process student withdrawal requests</p>
      </div>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          Approving a withdrawal will deduct the amount from the student's wallet balance.
        </AlertDescription>
      </Alert>

      {!withdrawals || withdrawals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No pending withdrawal requests</p>
            <p className="text-sm text-muted-foreground">Withdrawal requests will appear here when students submit them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {withdrawals.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Withdrawal Request</CardTitle>
                    <CardDescription>Request ID: {request.id}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{formatInr(request.amount)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">User</p>
                      <p className="font-medium truncate">{request.user.toText().slice(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Requested</p>
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={isApproving || isRejecting}
                    className="flex-1 gap-2"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={isApproving || isRejecting}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Reject
                      </>
                    )}
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
