import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTask, useAcceptTask, useSubmitTaskProof, useReviewTask, useGetUserRole, useGetUserAppRole } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import StatusBadge from '../../components/tasks/StatusBadge';
import PostedByLabel from '../../components/tasks/PostedByLabel';
import AdPlacementBanner from '../../components/ads/AdPlacementBanner';
import AdInterstitial from '../../components/ads/AdInterstitial';
import { DollarSign, MapPin, Clock, Tag, AlertCircle, Upload, CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import { TaskStatus, UserRole, UserAppRole, ExternalBlob, AdType } from '../../backend';
import { useState } from 'react';
import { formatInr } from '../../utils/formatInr';

export default function TaskDetailsPage() {
  const { taskId } = useParams({ from: '/tasks/$taskId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: task, isLoading } = useGetTask(taskId);
  const { data: userRole } = useGetUserRole();
  const { data: appRole } = useGetUserAppRole();
  const { mutate: acceptTask, isPending: isAccepting } = useAcceptTask();
  const { mutate: submitProof, isPending: isSubmitting } = useSubmitTaskProof();
  const { mutate: reviewTask, isPending: isReviewing } = useReviewTask();

  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isTaskProvider = task?.provider.toText() === currentUserPrincipal;
  const isAcceptedByCurrentUser = task?.acceptedBy?.toText() === currentUserPrincipal;
  const isStudent = appRole === UserAppRole.student;
  const isAdmin = userRole === UserRole.admin;

  const handleAccept = () => {
    if (confirm('Accept this task?')) {
      acceptTask({ taskId }, {
        onSuccess: () => {
          navigate({ to: '/student/tasks' });
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProofFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitProof = async () => {
    if (proofFiles.length === 0) {
      return;
    }

    const externalBlobs: ExternalBlob[] = [];
    
    for (const file of proofFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      externalBlobs.push(blob);
    }

    submitProof({ taskId, proofFiles: externalBlobs }, {
      onSuccess: () => {
        setProofFiles([]);
        setUploadProgress(0);
      }
    });
  };

  const handleApprove = () => {
    if (confirm('Approve this task? This will distribute payment: 90% to student, 10% to admin.')) {
      reviewTask({ taskId, approve: true }, {
        onSuccess: () => {
          setShowInterstitial(true);
        }
      });
    }
  };

  const handleReject = () => {
    if (confirm('Reject this task? The student will be able to resubmit proof.')) {
      reviewTask({ taskId, approve: false });
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Task not found</p>
            <Button onClick={() => navigate({ to: '/student/dashboard' })}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showAcceptButton = isStudent && task.status === TaskStatus.open && !isTaskProvider;
  const showUploadProof = isStudent && task.status === TaskStatus.inProgress && isAcceptedByCurrentUser;
  const showWaitingMessage = isStudent && task.status === TaskStatus.proofSubmitted && isAcceptedByCurrentUser;
  const showAdminReview = isAdmin && task.status === TaskStatus.proofSubmitted;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/student/dashboard' })}>
        ← Back
      </Button>

      {/* Top Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-3">{task.title}</CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <StatusBadge status={task.status} />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {task.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="text-2xl font-bold text-primary">{formatInr(task.paymentAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time Required</p>
                <p className="font-semibold">{task.timeRequired}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{task.location}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t space-y-2">
            <PostedByLabel providerId={task.provider.toText()} />
            {task.acceptanceDeadline && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(task.acceptanceDeadline)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AdPlacementBanner adType={AdType.taskBanner} className="my-4" />

      {/* Middle Section */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Proof Required:</span>
              <Badge variant={task.proof.proofFiles.length > 0 ? 'default' : 'secondary'}>
                {task.proof.proofFiles.length > 0 ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      {showAcceptButton && (
        <Card>
          <CardHeader>
            <CardTitle>Accept Task</CardTitle>
            <CardDescription>Click below to accept this task and start working on it</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAccept} disabled={isAccepting} className="w-full" size="lg">
              {isAccepting ? 'Accepting...' : 'Accept Task'}
            </Button>
          </CardContent>
        </Card>
      )}

      {showUploadProof && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Proof of Completion
            </CardTitle>
            <CardDescription>Upload files to prove you completed this task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Select Files</Label>
              <Input
                id="proof"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
              {proofFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {proofFiles.length} file(s) selected
                </p>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">{uploadProgress}%</p>
              </div>
            )}

            <Button
              onClick={handleSubmitProof}
              disabled={proofFiles.length === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Uploading...' : 'Submit Proof'}
            </Button>
          </CardContent>
        </Card>
      )}

      {showWaitingMessage && (
        <Card>
          <CardHeader>
            <CardTitle>Proof Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Waiting for admin review. You will be notified once the task is reviewed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {showAdminReview && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Review</CardTitle>
            <CardDescription>Review the submitted proof and approve or reject the task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Approving will distribute payment: 90% to student, 10% to admin commission.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isReviewing ? 'Processing...' : 'Approve & Complete'}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isReviewing}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isReviewing ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isTaskProvider && (
        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are the task provider. You can view the progress but cannot modify the task after acceptance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <AdInterstitial show={showInterstitial} onClose={() => setShowInterstitial(false)} />
    </div>
  );
}
