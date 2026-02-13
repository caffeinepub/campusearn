import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  public type TaskStatus = {
    #pendingApproval;
    #open;
    #assigned;
    #inProgress;
    #proofSubmitted;
    #underReview;
    #completed;
    #rejected;
    #declined;
  };

  public type TransactionType = {
    #deposit;
    #payout;
    #withdrawal;
    #taskPayment;
  };

  public type TaskProof = {
    proofFiles : [Storage.ExternalBlob];
    submittedAt : Time.Time;
  };

  public type TransactionRecord = {
    id : Text;
    user : Principal;
    amount : Nat;
    transactionType : TransactionType;
    transactionDate : Time.Time;
  };

  public type TransactionRecordExtended = {
    id : Text;
    user : Principal;
    amount : Nat;
    transactionType : TransactionType;
    transactionDate : Time.Time;
    relatedTaskId : ?Text;
    relatedTaskTitle : ?Text;
  };

  public type Task = {
    id : Text;
    title : Text;
    description : Text;
    category : Text;
    timeRequired : Text;
    paymentAmount : Nat;
    location : Text;
    status : TaskStatus;
    provider : Principal;
    acceptanceDeadline : ?Time.Time;
    acceptedBy : ?Principal;
    proof : TaskProof;
    revisionCount : Nat;
  };

  public type UserAppRole = {
    #student;
    #taskPoster;
    #business;
  };

  public type User = {
    profilePicture : ?Storage.ExternalBlob;
    name : Text;
    college : Text;
    year : Nat;
    verified : Bool;
    pendingVerification : Bool;
    phoneNumber : Text;
    verificationDocument : ?Storage.ExternalBlob;
    appRole : UserAppRole;
  };

  public type WalletEntry = {
    id : Text;
    timestamp : Time.Time;
    amount : Nat;
    description : Text;
  };

  public type TaskApplication = {
    id : Text;
    taskId : Text;
    applicant : Principal;
    status : ApplicationStatus;
    appliedAt : Time.Time;
    additionalInfo : Text;
  };

  public type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
    #declined;
  };

  public type VerificationRequest = {
    user : Principal;
    verificationDocument : Storage.ExternalBlob;
  };

  public type WithdrawalRequest = {
    id : Text;
    user : Principal;
    amount : Nat;
    status : WithdrawalStatus;
    createdAt : Time.Time;
  };

  public type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type TaskCompletion = {
    taskId : Text;
    student : Principal;
    completedAt : Time.Time;
  };

  public type AdType = {
    #dashboardBanner;
    #taskBanner;
    #taskCompletionInterstitial;
  };

  public type AdPlacement = {
    id : Text;
    adType : AdType;
    content : Text;
    frequency : Nat;
  };

  public type Rating = {
    id : Text;
    rating : Nat;
    comment : Text;
    createdBy : Principal;
    taskProvider : Principal;
    taskId : Text;
  };

  public type ActivityLogEntry = {
    user : Principal;
    action : ActivityAction;
    relatedTask : ?Text;
    timestamp : Time.Time;
  };

  public type ActivityAction = {
    #taskCreated;
    #taskAccepted;
    #proofUploaded;
    #taskApproved;
    #taskRejected;
    #walletCredited;
    #walletDebited;
    #withdrawalRequested;
    #withdrawalApproved;
  };

  public type Entity = {
    #user : User;
    #task : Task;
    #taskApplication : TaskApplication;
    #taskCompletion : TaskCompletion;
    #rating : Rating;
    #withdrawalRequest : WithdrawalRequest;
    #verificationRequest : VerificationRequest;
  };

  public type EntityType = {
    #user;
    #task;
    #taskApplication;
    #taskCompletion;
    #rating;
    #withdrawalRequest;
    #verificationRequest;
  };

  let taskIdCounter = Map.empty<Text, Nat>();
  let tasks = Map.empty<Text, Task>();
  let taskApplications = Map.empty<Text, List.List<TaskApplication>>();
  let users = Map.empty<Principal, User>();
  let userWallets = Map.empty<Principal, Nat>();
  let depositWallets = Map.empty<Principal, Nat>();
  let withdrawalRequests = Map.empty<Text, WithdrawalRequest>();
  let ratings = Map.empty<Text, List.List<Rating>>();
  let transactionHistory = Map.empty<Text, TransactionRecord>();
  let platformEscrow = Map.empty<Text, Nat>();
  let inPlatformWallet = Map.empty<Principal, Nat>();
  let systemFeesWallet = Map.empty<Principal, Nat>();
  let transactionIdCounter = Map.empty<Text, Nat>();
  let userRoles = Map.empty<Principal, UserAppRole>();
  let activityLog = Map.empty<Text, ActivityLogEntry>();
  let adPlacements = Map.empty<Text, AdPlacement>();

  var hasSeededDemoData = false;

  let defaultAds = Map.empty<Text, AdPlacement>();
  defaultAds.add("dashboardBanner", {
    id = "dashboardBanner";
    adType = #dashboardBanner;
    content = "Unlock more with Student Gig Exchange Pro: Exclusive discounts on task packages and priority support! Upgrade now and maximize your earning potential.";
    frequency = 1;
  });
  defaultAds.add("taskBanner", {
    id = "taskBanner";
    adType = #taskBanner;
    content = "Earn bonus rewards! Share your completed tasks on social media and tag Student Gig Exchange. Every successful referral earns you extra ₹50.";
    frequency = 2;
  });
  defaultAds.add("taskCompletionInterstitial", {
    id = "taskCompletionInter";
    adType = #taskCompletionInterstitial;
    content = "Great job! For every 10 tasks you complete, you'll unlock a special achievement and bonus reward. Keep up the awesome work!";
    frequency = 5;
  });

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func addActivityLogEntry(user : Principal, action : ActivityAction, relatedTask : ?Text) {
    let entry : ActivityLogEntry = {
      user;
      action;
      relatedTask;
      timestamp = Time.now();
    };
    let id = user.toText() # "-" # Time.now().toText();
    activityLog.add(id, entry);
  };

  public shared ({ caller }) func depositToWallet(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit to wallet");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#taskPoster) {};
      case (#business) {};
      case (#student) { Runtime.trap("Unauthorized: Only TaskPosters and Businesses can deposit") };
    };

    if (amount <= 0) {
      Runtime.trap("Deposit amount must be greater than zero");
    };

    let currentBalance = switch (depositWallets.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
    depositWallets.add(caller, currentBalance + amount);

    let newTransactionId = await getNextTransactionId(caller);
    let transactionRecord : TransactionRecord = {
      id = newTransactionId;
      amount;
      user = caller;
      transactionType = #deposit;
      transactionDate = Time.now();
    };

    transactionHistory.add(newTransactionId, transactionRecord);
    addActivityLogEntry(caller, #walletCredited, null);
  };

  func getNextTransactionId(_user : Principal) : async Text {
    let currentCounter = switch (transactionIdCounter.get("1.0")) {
      case (null) { 0 };
      case (?counter) { counter };
    };
    let nextCounter = currentCounter + 1;
    transactionIdCounter.add("1.0", nextCounter);
    nextCounter.toText();
  };

  public shared ({ caller }) func register(userType : AccessControl.UserRole, appRole : UserAppRole, name : Text, phoneNumber : Text) : async AccessControl.UserRole {
    if (users.containsKey(caller)) {
      Runtime.trap("This user is already registered.");
    };

    switch (userType) {
      case (#admin) { Runtime.trap("Cannot register as admin. Role must be assigned by another admin."); };
      case (#user) {};
      case (#guest) {};
    };

    let user : User = {
      name;
      phoneNumber;
      college = "";
      year = 0;
      verified = false;
      pendingVerification = false;
      verificationDocument = null;
      profilePicture = null;
      appRole;
    };

    users.add(caller, user);
    userRoles.add(caller, appRole);
    userType;
  };

  public shared ({ caller }) func uploadProfilePicture(profilePicture : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload profile pictures");
    };

    let currentUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let updatedUserData = {
      currentUser with
      profilePicture = ?profilePicture;
    };
    users.add(
      caller,
      updatedUserData,
    );
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?User {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view all");
    };
    users.get(userId);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : User) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
    userRoles.add(caller, profile.appRole);
  };

  public query ({ caller }) func getUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public query ({ caller }) func getUserAppRole() : async ?UserAppRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view app roles");
    };
    userRoles.get(caller);
  };

  public shared ({ caller }) func updateProfile(college : Text, year : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let currentUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let updatedUserData = { currentUser with college; year };
    users.add(caller, updatedUserData);
  };

  public shared ({ caller }) func submitCollegeVerification(
    college : Text,
    year : Nat,
    verificationDocument : Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit verification");
    };

    let currentUser = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };

    let updatedUserData = {
      currentUser with
      pendingVerification = true;
      verificationDocument = ?verificationDocument;
      college;
      year;
    };
    users.add(
      caller,
      updatedUserData,
    );
  };

  public shared ({ caller }) func verifyUser(userId : Principal, approve : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let currentUser = switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    let updatedUserData = {
      currentUser with
      verified = approve;
      pendingVerification = false;
      verificationDocument = null;
    };
    users.add(userId, updatedUserData);
  };

  public shared ({ caller }) func createTask(task : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#taskPoster) {};
      case (#business) {};
      case (#student) { Runtime.trap("Unauthorized: Only TaskPosters and Businesses can create tasks") };
    };

    let walletBalance = switch (depositWallets.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (walletBalance < task.paymentAmount) {
      Runtime.trap("Insufficient wallet balance. Please deposit funds before creating a task.");
    };

    let currentTaskIdValue = taskIdCounter.get(task.id);
    let currentTaskId = switch (currentTaskIdValue) {
      case (null) { 0 };
      case (?value) { value };
    };
    let newTaskId = currentTaskId + 1;

    let taskIdText = task.id # "-" # newTaskId.toText();

    let updatedTask : Task = {
      task with
      status = #open;
      provider = caller;
      id = taskIdText;
      acceptanceDeadline = null;
      acceptedBy = null;
    };

    depositWallets.add(caller, walletBalance - task.paymentAmount : Nat);
    platformEscrow.add(taskIdText, task.paymentAmount);

    tasks.add(updatedTask.id, updatedTask);
    taskIdCounter.add(task.id, newTaskId);

    let newTransactionId = await getNextTransactionId(caller);
    let transactionRecord : TransactionRecord = {
      id = newTransactionId;
      amount = task.paymentAmount;
      user = caller;
      transactionType = #taskPayment;
      transactionDate = Time.now();
    };
    transactionHistory.add(newTransactionId, transactionRecord);

    addActivityLogEntry(caller, #taskCreated, ?taskIdText);
    addActivityLogEntry(caller, #walletDebited, ?taskIdText);
  };

  public query ({ caller }) func getTasksByUser(user : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks or admin can view all");
    };

    let tasksByUser = tasks.values().toArray().filter(func(task) { task.provider == user });
    tasksByUser;
  };

  public shared ({ caller }) func getOpenTasks() : async [Task] {
    tasks.values().toArray().filter(func(task) {
      switch (task.status) {
        case (#open) { true };
        case (_) { false };
      };
    });
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tasks");
    };

    tasks.values().toArray();
  };

  public shared ({ caller }) func approveTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
    let updatedTask = {
      task with
      status = #open;
    };
    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func acceptTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept tasks");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#student) {};
      case (#taskPoster) { Runtime.trap("Unauthorized: Only Students can accept tasks") };
      case (#business) { Runtime.trap("Unauthorized: Only Students can accept tasks") };
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (task.provider == caller) {
      Runtime.trap("Cannot accept your own task");
    };

    switch (task.status) {
      case (#open) {};
      case (_) { Runtime.trap("Task is not open for acceptance") };
    };

    switch (task.acceptedBy) {
      case (?_) { Runtime.trap("Task has already been accepted") };
      case (null) {};
    };

    let updatedTask = {
      task with
      status = #inProgress;
      acceptedBy = ?caller;
    };
    tasks.add(taskId, updatedTask);

    addActivityLogEntry(caller, #taskAccepted, ?taskId);
  };

  public shared ({ caller }) func applyForTask(id : Text, taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply for tasks");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#student) {};
      case (#taskPoster) { Runtime.trap("Unauthorized: Only Students can apply for tasks") };
      case (#business) { Runtime.trap("Unauthorized: Only Students can apply for tasks") };
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (task.provider == caller) {
      Runtime.trap("Cannot apply for your own task");
    };

    switch (task.status) {
      case (#open) {};
      case (_) { Runtime.trap("Task is not open for applications") };
    };

    let application : TaskApplication = {
      id;
      taskId;
      applicant = caller;
      status = #pending;
      appliedAt = Time.now();
      additionalInfo = "";
    };
    let existingApplications = taskApplications.get(taskId);
    switch (existingApplications) {
      case (null) {
        let newList = List.empty<TaskApplication>();
        newList.add(application);
        taskApplications.add(taskId, newList);
      };
      case (?applications) {
        applications.add(application);
        taskApplications.add(taskId, applications);
      };
    };
  };

  public query ({ caller }) func getTask(taskId : Text) : async ?Task {
    let task = switch (tasks.get(taskId)) {
      case (null) { return null };
      case (?t) { t };
    };

    let hasAccess = switch (task.status) {
      case (#open) { true };
      case (_) {
        task.provider == caller or
        (switch (task.acceptedBy) {
          case (?student) { student == caller };
          case (null) { false };
        }) or
        AccessControl.isAdmin(accessControlState, caller)
      };
    };

    if (not hasAccess) {
      Runtime.trap("Unauthorized: Cannot view this task");
    };

    ?task;
  };

  public shared ({ caller }) func submitTaskProof(taskId : Text, proofFiles : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit task proof");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#student) {};
      case (#taskPoster) { Runtime.trap("Unauthorized: Only Students can submit proof") };
      case (#business) { Runtime.trap("Unauthorized: Only Students can submit proof") };
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    switch (task.status) {
      case (#inProgress) {};
      case (_) { Runtime.trap("Task is not in progress") };
    };

    switch (task.acceptedBy) {
      case (null) { Runtime.trap("Task not accepted by any student") };
      case (?student) {
        if (student != caller) {
          Runtime.trap("Only the student who accepted the task can submit proof");
        };
      };
    };

    let taskProof : TaskProof = {
      proofFiles;
      submittedAt = Time.now();
    };

    let updatedTask = {
      task with
      status = #proofSubmitted;
      proof = taskProof;
    };
    tasks.add(taskId, updatedTask);
    addActivityLogEntry(caller, #proofUploaded, ?taskId);
  };

  public shared ({ caller }) func reviewTask(taskId : Text, approve : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can review tasks");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    switch (task.status) {
      case (#proofSubmitted) {};
      case (_) { Runtime.trap("Task proof has not been submitted yet") };
    };

    let escrowAmount = switch (platformEscrow.get(taskId)) {
      case (null) { Runtime.trap("Escrow not found for this task") };
      case (?amount) { amount };
    };

    let updatedTask = {
      task with
      status = #underReview;
    };

    tasks.add(taskId, updatedTask);

    let finalTaskStatus = if (approve) { #completed } else { #inProgress };

    let finalUpdatedTask = {
      updatedTask with
      status = finalTaskStatus;
    };

    tasks.add(taskId, finalUpdatedTask);

    if (approve) {
      switch (task.acceptedBy) {
        case (null) { Runtime.trap("Task not accepted by any student") };
        case (?student) {
          let studentPayout = (escrowAmount * 90) / 100;
          let adminPayout = escrowAmount - studentPayout : Nat;

          let studentBalance = switch (userWallets.get(student)) {
            case (null) { 0 };
            case (?balance) { balance };
          };
          userWallets.add(student, studentBalance + studentPayout);

          let adminBalance = switch (systemFeesWallet.get(caller)) {
            case (null) { 0 };
            case (?balance) { balance };
          };
          systemFeesWallet.add(caller, adminBalance + adminPayout);

          platformEscrow.add(taskId, 0);
          let studentTransactionId = await getNextTransactionId(student);

          let studentTransaction : TransactionRecord = {
            id = studentTransactionId;
            amount = studentPayout;
            user = student;
            transactionType = #payout;
            transactionDate = Time.now();
          };
          transactionHistory.add(studentTransactionId, studentTransaction);

          let adminTransactionId = await getNextTransactionId(caller);
          let adminTransaction : TransactionRecord = {
            id = adminTransactionId;
            amount = adminPayout;
            user = caller;
            transactionType = #payout;
            transactionDate = Time.now();
          };
          transactionHistory.add(adminTransactionId, adminTransaction);

          addActivityLogEntry(caller, #taskApproved, ?taskId);
          addActivityLogEntry(student, #walletCredited, ?taskId);
        };
      };
    } else {
      addActivityLogEntry(caller, #taskRejected, ?taskId);
    };
  };

  public shared ({ caller }) func requestTaskRevision(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can request revisions");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    switch (task.status) {
      case (#proofSubmitted) {};
      case (#underReview) {};
      case (_) { Runtime.trap("Task is not in review") };
    };

    let updatedTask = {
      task with
      status = #inProgress;
      revisionCount = task.revisionCount + 1;
    };

    tasks.add(taskId, updatedTask);
  };

  public query ({ caller }) func getProofFiles(taskId : Text) : async [Storage.ExternalBlob] {
    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    let hasAccess = task.provider == caller or
      (switch (task.acceptedBy) {
        case (?student) { student == caller };
        case (null) { false };
      }) or
      AccessControl.isAdmin(accessControlState, caller);

    if (not hasAccess) {
      Runtime.trap("Unauthorized: Cannot view proof files for this task");
    };

    switch (task.status) {
      case (#proofSubmitted) { task.proof.proofFiles };
      case (#underReview) { task.proof.proofFiles };
      case (#completed) { task.proof.proofFiles };
      case (_) { Runtime.trap("Proof files not available for this task") };
    };
  };

  public query ({ caller }) func getPendingVerificationRequests() : async [VerificationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view verification requests");
    };

    let verificationRequests = users.toArray().filter(
      func((_, user)) {
        user.pendingVerification;
      }
    ).map(
      func((userId, user)) {
        {
          user = userId;
          verificationDocument = switch (user.verificationDocument) {
            case (null) { Runtime.trap("Verification document not found") };
            case (?doc) { doc };
          };
        };
      }
    );
    verificationRequests;
  };

  public query ({ caller }) func getWalletBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallet balance");
    };

    let balance = userWallets.get(caller);
    switch (balance) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getDepositBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deposit balance");
    };

    let balance = depositWallets.get(caller);
    switch (balance) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func createWithdrawRequest(withdrawalId : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawal requests");
    };

    let callerRole = switch (userRoles.get(caller)) {
      case (null) { Runtime.trap("User role not found. Please complete registration.") };
      case (?role) { role };
    };

    switch (callerRole) {
      case (#student) {};
      case (#taskPoster) { Runtime.trap("Unauthorized: Only Students can create withdrawal requests") };
      case (#business) { Runtime.trap("Unauthorized: Only Students can create withdrawal requests") };
    };

    if (amount <= 0) {
      Runtime.trap("Withdrawal amount must be greater than zero");
    };

    let balance = userWallets.get(caller);
    switch (balance) {
      case (null) { Runtime.trap("Insufficient balance for withdrawal") };
      case (?balance) {
        if (balance < amount) {
          Runtime.trap("Insufficient balance for withdrawal");
        };
      };
    };

    let withdrawalRequest : WithdrawalRequest = {
      id = withdrawalId;
      user = caller;
      amount;
      status = #pending;
      createdAt = Time.now();
    };
    withdrawalRequests.add(withdrawalId, withdrawalRequest);
    addActivityLogEntry(caller, #withdrawalRequested, null);
  };

  public shared ({ caller }) func approveWithdrawRequest(requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let request = switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };

    if (caller == request.user) {
      Runtime.trap("Cannot approve your own withdrawal request");
    };

    if (request.status != #pending) {
      Runtime.trap("Request is not in pending status");
    };

    let userBalance = userWallets.get(request.user);
    switch (userBalance) {
      case (null) { Runtime.trap("Insufficient balance") };
      case (?balance) {
        if (balance < request.amount) {
          Runtime.trap("Insufficient balance");
        };
        userWallets.add(request.user, balance - request.amount : Nat);
      };
    };

    let updatedRequest = {
      request with
      status = #approved;
    };

    withdrawalRequests.add(requestId, updatedRequest);

    let newTransactionId = await getNextTransactionId(request.user);
    let transactionRecord : TransactionRecord = {
      id = newTransactionId;
      amount = request.amount;
      user = request.user;
      transactionType = #withdrawal;
      transactionDate = Time.now();
    };
    transactionHistory.add(newTransactionId, transactionRecord);

    addActivityLogEntry(caller, #withdrawalApproved, null);
    addActivityLogEntry(request.user, #walletDebited, null);
  };

  public shared ({ caller }) func rejectWithdrawRequest(requestId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let request = switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };

    if (request.status != #pending) {
      Runtime.trap("Request is not in pending status");
    };

    let updatedRequest = {
      request with
      status = #rejected;
    };
    withdrawalRequests.add(requestId, updatedRequest);
  };

  public query ({ caller }) func getPendingWithdrawalRequests() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view withdrawal requests");
    };

    withdrawalRequests.values().toArray().filter(
      func(request) {
        request.status == #pending;
      }
    );
  };

  public query ({ caller }) func getTransactionHistory() : async [TransactionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };

    transactionHistory.values().toArray().filter(
      func(transaction) {
        transaction.user == caller;
      }
    );
  };

  public query ({ caller }) func getAllTransactionHistory() : async [TransactionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transaction history");
    };

    transactionHistory.values().toArray();
  };

  public query ({ caller }) func getAllTransactionHistoryExtended() : async [TransactionRecordExtended] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transaction history");
    };

    transactionHistory.values().toArray().map(
      func(record) {
        {
          record with
          relatedTaskId = null;
          relatedTaskTitle = null;
        };
      }
    );
  };

  public query ({ caller }) func getActivityLog() : async [ActivityLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view activity log");
    };

    let entries = activityLog.entries().map(
      func((_, entry)) { entry }
    );
    entries.toArray();
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      switch (Text.compare(task1.title, task2.title)) {
        case (#equal) { Text.compare(task1.id, task2.id) };
        case (order) { order };
      };
    };
  };

  module Rating {
    public func compare(rating1 : Rating, rating2 : Rating) : Order.Order {
      switch (Text.compare(rating1.comment, rating2.comment)) {
        case (#equal) { Text.compare(rating1.id, rating2.id) };
        case (order) { order };
      };
    };
  };

  public shared ({ caller }) func ensureDemoDataSeeded() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed demo data");
    };

    if (not hasSeededDemoData) {
      hasSeededDemoData := true;
    };
  };

  public shared ({ caller }) func setDemoDataSeeded() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set demo data seeded flag");
    };
    hasSeededDemoData := true;
  };

  public query ({ caller }) func getAdPlacement(_adType : AdType) : async AdPlacement {
    switch (adPlacements.get("dashboardBanner")) {
      case (?dashboardAd) { dashboardAd };
      case (null) {
        switch (defaultAds.get("dashboardBanner")) {
          case (?defaultAdd) { defaultAdd };
          case (null) { Runtime.trap("No default dashboard ad found") };
        };
      };
    };
  };

  public shared ({ caller }) func updateAdPlacement(adType : AdType, newAd : AdPlacement) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ads");
    };
    adPlacements.add(newAd.id, newAd);
  };

  public query ({ caller }) func getAdPlacements() : async [AdPlacement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all ad placements");
    };
    adPlacements.values().toArray();
  };

  public shared ({ caller }) func resetAdPlacements() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset ad placements");
    };
    adPlacements.clear();
  };

  public query ({ caller }) func isDemoDataSeeded() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check demo data seeded status");
    };
    hasSeededDemoData;
  };
};
