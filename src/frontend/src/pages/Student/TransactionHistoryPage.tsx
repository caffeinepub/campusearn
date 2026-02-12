import { useGetTransactionHistory } from '../../hooks/useQueries';
import { Card, CardContent } from '../../components/ui/card';
import TransactionHistoryTable from '../../components/transactions/TransactionHistoryTable';

export default function TransactionHistoryPage() {
  const { data: transactions, isLoading } = useGetTransactionHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View all your financial transactions</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </CardContent>
        </Card>
      ) : (
        <TransactionHistoryTable transactions={transactions || []} />
      )}
    </div>
  );
}
