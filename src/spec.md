# Specification

## Summary
**Goal:** Enable in-app wallet deposits (for TaskPoster/Business) and withdrawals (for Students with Admin approval), with accurate transaction history in INR.

**Planned changes:**
- Add/verify wallet deposit flow for TaskPoster and Business users: submit deposit amount, persist updated wallet balance, and create a persisted Deposit transaction record.
- Add/verify wallet withdrawal flow for Student users: submit withdrawal request, persist request, and provide an Admin screen to approve/reject; on approval, debit wallet and record a persisted Withdrawal transaction.
- Update/verify transaction history retrieval and UI display to include Deposit/Withdrawal records with consistent INR (₹) formatting and correct credit/debit indicators; hide or block actions based on role.

**User-visible outcome:** TaskPoster/Business users can deposit INR into their in-app wallet, Students can request withdrawals that Admins can approve/reject, and all users see deposit/withdrawal transactions reflected correctly in wallet balance and transaction history.
