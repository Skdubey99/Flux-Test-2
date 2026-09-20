# Security Specification & Test Payloads

## 1. Data Invariants
- Each user account document in `/users/{userId}` belongs to either the authenticated user (`request.auth.uid == userId`) or an administrator.
- Sensitive credentials (like password hashes or private contact information) can only be read or written by the document owner or admin.
- Each user's financial vault in `/vaults/{userId}` is strictly isolated. A user can only read and write their own vault (`request.auth.uid == userId` or `resource.data.userId == request.auth.uid`).
- Non-admin users cannot elevate their role to `admin` or modify their `role` field.
- Document IDs must conform to alphanumeric/safe string patterns (`isValidId`).

## 2. The Dirty Dozen Test Payloads
1. **Unauthenticated Read to Users Collection**: Requesting `/users/{userId}` without an active Firebase Auth session -> EXPECT PERMISSION_DENIED.
2. **Cross-User Vault Read**: User `usr_alice` attempting to read `/vaults/usr_bob` -> EXPECT PERMISSION_DENIED.
3. **Cross-User Vault Write**: User `usr_alice` attempting to overwrite `/vaults/usr_bob` -> EXPECT PERMISSION_DENIED.
4. **Privilege Escalation during Registration**: User `usr_charlie` submitting `role: "admin"` during initial document creation without being in `/admins` -> EXPECT PERMISSION_DENIED.
5. **Privilege Escalation during Update**: Standard user updating their own profile with `role: "admin"` -> EXPECT PERMISSION_DENIED.
6. **Malicious ID Injection**: Path variable with special characters e.g. `/users/<script>alert(1)</script>` -> EXPECT PERMISSION_DENIED.
7. **Junk Field Pollution**: Sending shadow fields (`ghostField: "exploit"`) on user creation -> EXPECT PERMISSION_DENIED.
8. **Blanket Query Scraping**: Issuing a collection query `collection('vaults')` without scoping to `userId == request.auth.uid` -> EXPECT PERMISSION_DENIED.
9. **Tampering with userId on Vault**: Authenticated user `usr_alice` writing to `/vaults/usr_alice` but setting `userId: "usr_bob"` -> EXPECT PERMISSION_DENIED.
10. **Oversized String Payload Attack (Denial of Wallet)**: Setting `name` to a 500KB string -> EXPECT PERMISSION_DENIED.
11. **Suspended User Lockout**: Suspended user trying to execute writes while `status: "suspended"` -> EXPECT PERMISSION_DENIED.
12. **Unauthenticated List on Vaults**: Querying `/vaults` without authentication -> EXPECT PERMISSION_DENIED.
