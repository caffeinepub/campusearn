import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { TransactionRecord, TransactionType } from '../../backend';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatInr } from '../../utils/formatInr';

interface TransactionHistoryTableProps {
  transactions: TransactionRecord[];
}

export default function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
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

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.deposit:
        return 'Deposit';
      case TransactionType.payout:
        return 'Payout';
      case TransactionType.withdrawal:
        return 'Withdrawal';
      case TransactionType.taskPayment:
        return 'Task Payment';
      default:
        return 'Unknown';
    }
  };

  const isCredit = (type: TransactionType) => {
    return type === TransactionType.deposit || type === TransactionType.payout;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const credit = isCredit(transaction.transactionType);
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {formatDate(transaction.transactionDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {credit ? (
                      <ArrowDownCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>{getTransactionTypeLabel(transaction.transactionType)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={credit ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {credit ? '+' : '-'}{formatInr(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
