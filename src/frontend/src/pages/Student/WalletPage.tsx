import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useGetWalletBalance, useCreateWithdrawalRequest, useGetTransactionHistory } from '../../hooks/useQueries';
import TransactionHistoryTable from '../../components/transactions/TransactionHistoryTable';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { formatInr } from '../../utils/formatInr';

export default function WalletPage() {
  const { data: walletBalance, isLoading: balanceLoading } = useGetWalletBalance();
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactionHistory();
  const { mutate: createWithdrawal, isPending } = useCreateWithdrawalRequest();

  const [amount, setAmount] = useState('');

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount);
    const balance = Number(walletBalance || BigInt(0));

    if (withdrawAmount <= 0 || withdrawAmount > balance) {
      return;
    }

    createWithdrawal({ amount: withdrawAmount }, {
      onSuccess: () => {
        setAmount('');
      }
    });
  };

  const withdrawAmount = parseInt(amount) || 0;
  const balance = Number(walletBalance || BigInt(0));
  const insufficientBalance = withdrawAmount > balance;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Current Balance
          </CardTitle>
          <CardDescription>Your available balance for withdrawal</CardDescription>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <p className="text-4xl font-bold text-primary">{formatInr(walletBalance || BigInt(0))}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Request a withdrawal from your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              min="1"
              max={balance}
            />
          </div>

          {insufficientBalance && amount && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient balance. You have {formatInr(walletBalance || BigInt(0))} available.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleWithdraw}
            disabled={isPending || !amount || withdrawAmount <= 0 || insufficientBalance}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Request Withdrawal'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TransactionHistoryTable transactions={transactions || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
