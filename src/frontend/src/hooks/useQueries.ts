import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { User, Task, VerificationRequest, UserRole, UserAppRole, TransactionRecord, WithdrawalRequest, ActivityLogEntry, TransactionRecordExtended, AdPlacement, AdType } from '../backend';
import { ExternalBlob, TaskStatus } from '../backend';
import { toast } from 'sonner';

export function useGetUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetUserAppRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserAppRole | null>({
    queryKey: ['userAppRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserAppRole();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetUserProfile(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<User | null>({
    queryKey: ['userProfile', userId || identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = userId ? { toText: () => userId } : identity.getPrincipal();
      return actor.getUserProfile(principal as any);
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<User | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phoneNumber, appRole }: { name: string; phoneNumber: string; appRole: UserAppRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.register({ __kind__: 'user' } as any, appRole, name, phoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userRole'] });
      queryClient.invalidateQueries({ queryKey: ['userAppRole'] });
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    }
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: User) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['depositBalance'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ college, year }: { college: string; year: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(college, BigInt(year));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
}

export function useSubmitVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      college,
      year,
      document
    }: {
      college: string;
      year: number;
      document: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCollegeVerification(college, BigInt(year), document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Verification submitted! Awaiting admin approval.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit verification');
    }
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetOpenTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Task[]>({
    queryKey: ['openTasks', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOpenTasks();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false
  });
}

export function useGetTask(taskId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTask(taskId);
    },
    enabled: !!actor && !isFetching && !!taskId,
    retry: false
  });
}

export function useGetTasksByUser(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Task[]>({
    queryKey: ['userTasks', userId || identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = userId ? { toText: () => userId } : identity.getPrincipal();
      return actor.getTasksByUser(principal as any);
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'status' | 'provider' | 'proof' | 'revisionCount'>) => {
      if (!actor) throw new Error('Actor not available');
      const taskWithId: Task = {
        ...task,
        id: `task-${Date.now()}`,
        status: TaskStatus.open,
        provider: { toText: () => '' } as any,
        proof: {
          proofFiles: [],
          submittedAt: BigInt(0)
        },
        revisionCount: BigInt(0)
      };
      return actor.createTask(taskWithId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      queryClient.invalidateQueries({ queryKey: ['depositBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['openTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task');
    }
  });
}

export function useAcceptTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['openTasks', identity?.getPrincipal().toString()] 
      });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Task accepted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept task');
    }
  });
}

export function useSubmitTaskProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, proofFiles }: { taskId: string; proofFiles: ExternalBlob[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitTaskProof(taskId, proofFiles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Proof submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit proof');
    }
  });
}

export function useReviewTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, approve }: { taskId: string; approve: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewTask(taskId, approve);
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success(approve ? 'Task approved! Payment distributed.' : 'Task rejected. Student can resubmit proof.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to review task');
    }
  });
}

export function useGetPendingVerifications() {
  const { actor, isFetching } = useActor();

  return useQuery<VerificationRequest[]>({
    queryKey: ['pendingVerifications'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingVerificationRequests();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useVerifyUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyUser({ toText: () => userId } as any, approve);
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingVerifications'] });
      toast.success(approve ? 'User verified successfully!' : 'Verification rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process verification');
    }
  });
}

export function useApproveTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['openTasks'] });
      toast.success('Task approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve task');
    }
  });
}

export function useGetWalletBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWalletBalance();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetDepositBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['depositBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDepositBalance();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useDepositToWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.depositToWallet(BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depositBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Deposit successful!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deposit');
    }
  });
}

export function useCreateWithdrawalRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      const withdrawalId = `withdrawal-${Date.now()}`;
      return actor.createWithdrawRequest(withdrawalId, BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Withdrawal request created! Awaiting admin approval.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create withdrawal request');
    }
  });
}

export function useGetPendingWithdrawals() {
  const { actor, isFetching } = useActor();

  return useQuery<WithdrawalRequest[]>({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingWithdrawalRequests();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveWithdrawRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
      toast.success('Withdrawal approved!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve withdrawal');
    }
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectWithdrawRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
      toast.success('Withdrawal rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject withdrawal');
    }
  });
}

export function useGetTransactionHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<TransactionRecord[]>({
    queryKey: ['transactionHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetAllTransactionHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<TransactionRecord[]>({
    queryKey: ['allTransactionHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransactionHistory();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetAllTransactionHistoryExtended() {
  const { actor, isFetching } = useActor();

  return useQuery<TransactionRecordExtended[]>({
    queryKey: ['allTransactionHistoryExtended'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransactionHistoryExtended();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetActivityLog() {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityLogEntry[]>({
    queryKey: ['activityLog'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActivityLog();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetAdPlacement(adType: AdType) {
  const { actor, isFetching } = useActor();

  return useQuery<AdPlacement>({
    queryKey: ['adPlacement', adType],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdPlacement(adType);
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetAdPlacements() {
  const { actor, isFetching } = useActor();

  return useQuery<AdPlacement[]>({
    queryKey: ['adPlacements'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdPlacements();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useUpdateAdPlacement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adType, newAd }: { adType: AdType; newAd: AdPlacement }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdPlacement(adType, newAd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adPlacements'] });
      queryClient.invalidateQueries({ queryKey: ['adPlacement'] });
      toast.success('Ad placement updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update ad placement');
    }
  });
}
