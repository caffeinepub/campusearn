# Specification

## Summary
**Goal:** Upgrade CampusEarn into a professional INR (₹) student task marketplace with role-based workflows, seeded demo data, editable profiles, wallet/escrow flows, ads monetization, and admin controls—while preserving all existing backend data/state.

**Planned changes:**
- Preserve existing backend stable state across upgrade; ensure any migrations/seeding are non-destructive and idempotent.
- Add “Business” role and enforce role-based permissions across backend APIs and frontend navigation/actions (Student vs TaskPoster/Business vs Admin).
- Add deterministic demo seeding for 6 named demo users (with specified phone/email/balance/role) and 10 Open demo tasks, without duplicating or deleting existing records.
- Update Profile data model/UI to remove college/year fields; implement editable Full Name/Contact/Email with Wallet and Role as read-only; persist changes after refresh.
- Standardize all money handling and display to Indian Rupees (₹) across wallets, tasks, escrow, commissions, withdrawals, ads, and transactions.
- Implement Task Creation for TaskPoster/Business with specified fields; on create, set task Open and move payment from provider wallet into escrow; block if insufficient balance.
- Implement and enforce task lifecycle and anti-abuse rules: Open → In Progress → Proof Submitted → Under Review → Completed; Reject returns to In Progress; prevent duplicate acceptance, accepting own task, and provider edits after acceptance.
- Upgrade Student Task Dashboard and Task Details layout: Open task cards with required fields and role-based actions; required empty-state text when no open tasks.
- Implement end-to-end wallet workflows: provider deposits, escrow locking, completion payout split (90% Student / 10% Admin), student withdrawal requests with admin approval, and immutable transaction history.
- Record required activity log events and add an Admin-only activity log viewer sourced from backend data.
- Add internal ads placements (dashboard banner, task details banner, optional completion interstitial) with Admin-configurable frequency; record ad earnings in ₹.
- Connect all forms/actions to backend mutations with React Query invalidation; ensure persistence after refresh and mobile-deeplink navigation to task details.
- Apply consistent blue/white professional UI theme, card-based layout, sidebar navigation, modern typography, mobile responsiveness, and English-only user-facing text.

**User-visible outcome:** Users can sign in and use a professional CampusEarn marketplace in ₹ with Student/Provider/Admin role-appropriate dashboards and actions, seeded demo users/tasks for testing, persistent editable profiles, full wallet/escrow/deposit/withdraw flows with transaction history, admin approvals and activity logs, and configurable in-app ads—without losing any existing data after upgrade or refresh.
