import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // OLD TYPES
  type OldUserAppRole = {
    #student;
    #taskPoster;
  };

  type OldUser = {
    profilePicture : ?Storage.ExternalBlob;
    name : Text;
    college : Text;
    year : Nat;
    verified : Bool;
    pendingVerification : Bool;
    phoneNumber : Text;
    verificationDocument : ?Storage.ExternalBlob;
    appRole : OldUserAppRole;
  };

  type OldActor = {
    taskIdCounter : Map.Map<Text, Nat>;
    users : Map.Map<Principal, OldUser>;
    userWallets : Map.Map<Principal, Nat>;
    inPlatformWallet : Map.Map<Principal, Nat>;
    systemFeesWallet : Map.Map<Principal, Nat>;
    transactionIdCounter : Map.Map<Text, Nat>;
    userRoles : Map.Map<Principal, OldUserAppRole>;
  };

  // NEW TYPES
  type NewUserAppRole = {
    #student;
    #taskPoster;
    #business;
  };

  type NewUser = {
    profilePicture : ?Storage.ExternalBlob;
    name : Text;
    college : Text;
    year : Nat;
    verified : Bool;
    pendingVerification : Bool;
    phoneNumber : Text;
    verificationDocument : ?Storage.ExternalBlob;
    appRole : NewUserAppRole;
  };

  type NewActor = {
    taskIdCounter : Map.Map<Text, Nat>;
    users : Map.Map<Principal, NewUser>;
    userWallets : Map.Map<Principal, Nat>;
    inPlatformWallet : Map.Map<Principal, Nat>;
    systemFeesWallet : Map.Map<Principal, Nat>;
    transactionIdCounter : Map.Map<Text, Nat>;
    userRoles : Map.Map<Principal, NewUserAppRole>;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUser, NewUser>(
      func(_principal, oldUser) {
        { oldUser with appRole = convertUserAppRole(oldUser.appRole) };
      }
    );
    let newUserRoles = old.userRoles.map<Principal, OldUserAppRole, NewUserAppRole>(
      func(_principal, oldUserAppRole) {
        convertUserAppRole(oldUserAppRole);
      }
    );
    {
      old with
      users = newUsers;
      userRoles = newUserRoles;
    };
  };

  func convertUserAppRole(oldRole : OldUserAppRole) : NewUserAppRole {
    switch (oldRole) {
      case (#student) { #student };
      case (#taskPoster) { #taskPoster };
    };
  };
};
