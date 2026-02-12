import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransactionRecordExtended {
    id: string;
    transactionDate: Time;
    transactionType: TransactionType;
    user: Principal;
    relatedTaskId?: string;
    relatedTaskTitle?: string;
    amount: bigint;
}
export interface AdPlacement {
    id: string;
    content: string;
    adType: AdType;
    frequency: bigint;
}
export type Time = bigint;
export interface User {
    pendingVerification: boolean;
    verified: boolean;
    appRole: UserAppRole;
    name: string;
    year: bigint;
    verificationDocument?: ExternalBlob;
    phoneNumber: string;
    profilePicture?: ExternalBlob;
    college: string;
}
export interface Task {
    id: string;
    status: TaskStatus;
    title: string;
    provider: Principal;
    timeRequired: string;
    acceptanceDeadline?: Time;
    revisionCount: bigint;
    description: string;
    category: string;
    proof: TaskProof;
    acceptedBy?: Principal;
    paymentAmount: bigint;
    location: string;
}
export interface TaskProof {
    proofFiles: Array<ExternalBlob>;
    submittedAt: Time;
}
export interface ActivityLogEntry {
    action: ActivityAction;
    user: Principal;
    timestamp: Time;
    relatedTask?: string;
}
export interface TransactionRecord {
    id: string;
    transactionDate: Time;
    transactionType: TransactionType;
    user: Principal;
    amount: bigint;
}
export interface WithdrawalRequest {
    id: string;
    status: WithdrawalStatus;
    createdAt: Time;
    user: Principal;
    amount: bigint;
}
export interface VerificationRequest {
    user: Principal;
    verificationDocument: ExternalBlob;
}
export enum ActivityAction {
    walletDebited = "walletDebited",
    walletCredited = "walletCredited",
    withdrawalApproved = "withdrawalApproved",
    taskApproved = "taskApproved",
    proofUploaded = "proofUploaded",
    taskRejected = "taskRejected",
    withdrawalRequested = "withdrawalRequested",
    taskCreated = "taskCreated",
    taskAccepted = "taskAccepted"
}
export enum AdType {
    taskBanner = "taskBanner",
    taskCompletionInterstitial = "taskCompletionInterstitial",
    dashboardBanner = "dashboardBanner"
}
export enum TaskStatus {
    proofSubmitted = "proofSubmitted",
    assigned = "assigned",
    underReview = "underReview",
    open = "open",
    completed = "completed",
    pendingApproval = "pendingApproval",
    rejected = "rejected",
    declined = "declined",
    inProgress = "inProgress"
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal",
    taskPayment = "taskPayment",
    payout = "payout"
}
export enum UserAppRole {
    taskPoster = "taskPoster",
    business = "business",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    acceptTask(taskId: string): Promise<void>;
    applyForTask(id: string, taskId: string): Promise<void>;
    approveTask(taskId: string): Promise<void>;
    approveWithdrawRequest(requestId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(task: Task): Promise<void>;
    createWithdrawRequest(withdrawalId: string, amount: bigint): Promise<void>;
    depositToWallet(amount: bigint): Promise<void>;
    ensureDemoDataSeeded(): Promise<void>;
    getActivityLog(): Promise<Array<ActivityLogEntry>>;
    getAdPlacement(_adType: AdType): Promise<AdPlacement>;
    getAdPlacements(): Promise<Array<AdPlacement>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllTransactionHistory(): Promise<Array<TransactionRecord>>;
    getAllTransactionHistoryExtended(): Promise<Array<TransactionRecordExtended>>;
    getCallerUserProfile(): Promise<User | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepositBalance(): Promise<bigint>;
    getOpenTasks(): Promise<Array<Task>>;
    getPendingVerificationRequests(): Promise<Array<VerificationRequest>>;
    getPendingWithdrawalRequests(): Promise<Array<WithdrawalRequest>>;
    getProofFiles(taskId: string): Promise<Array<ExternalBlob>>;
    getTask(taskId: string): Promise<Task | null>;
    getTasksByUser(user: Principal): Promise<Array<Task>>;
    getTransactionHistory(): Promise<Array<TransactionRecord>>;
    getUserAppRole(): Promise<UserAppRole | null>;
    getUserProfile(userId: Principal): Promise<User | null>;
    getUserRole(): Promise<UserRole>;
    getWalletBalance(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    isDemoDataSeeded(): Promise<boolean>;
    register(userType: UserRole, appRole: UserAppRole, name: string, phoneNumber: string): Promise<UserRole>;
    rejectWithdrawRequest(requestId: string): Promise<void>;
    requestTaskRevision(taskId: string): Promise<void>;
    resetAdPlacements(): Promise<void>;
    reviewTask(taskId: string, approve: boolean): Promise<void>;
    saveCallerUserProfile(profile: User): Promise<void>;
    setDemoDataSeeded(): Promise<void>;
    submitCollegeVerification(college: string, year: bigint, verificationDocument: ExternalBlob): Promise<void>;
    submitTaskProof(taskId: string, proofFiles: Array<ExternalBlob>): Promise<void>;
    updateAdPlacement(adType: AdType, newAd: AdPlacement): Promise<void>;
    updateProfile(college: string, year: bigint): Promise<void>;
    uploadProfilePicture(profilePicture: ExternalBlob): Promise<void>;
    verifyUser(userId: Principal, approve: boolean): Promise<void>;
}
