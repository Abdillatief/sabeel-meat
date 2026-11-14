# Sabeel Meet Firestore Security Specification

## 1. Data Invariants
1. Every top-level workspace document (`users`, `settings`, `classes`, `meetings`, `teachers`, `students`, `notifications`) is owned by a verified authenticated user (`ownerId == request.auth.uid`).
2. User PII (`email`) is strictly isolated in `/users/{userId}/private/info` and readable/writable only by the owning user.
3. A `meetings` document, `notes` document, `classes/{classId}/messages` document, or `classes/{classId}/files` document cannot be created unless the referenced `classes/{classId}` document exists and belongs to the authenticated owner.
4. Immutable fields (`ownerId`, `createdAt`, `role` on user creation) cannot be modified on update.
5. All timestamps (`createdAt`, `updatedAt`) must match `request.time` on write.
6. Every document ID path variable is validated with `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars) on single-document operations (`get`, `create`, `update`, `delete`).
7. Every `allow list` query enforces `existing().ownerId == request.auth.uid` on `resource.data` with zero `get()` or `exists()` lookups.

## 2. Dirty Dozen Adversarial Payloads
1. **Unverified Email Create**: Creating `/classes/cls-1` when `request.auth.token.email_verified == false` -> DENIED.
2. **Owner Spoofing**: Creating `/classes/cls-1` with `ownerId: "other-uid"` -> DENIED.
3. **Role Escalation**: Creating `/users/{uid}` with `role: "Admin"` or updating `role` from `"Student"` to `"Instructor"` -> DENIED.
4. **Shadow Ghost Field**: Updating `/settings/{uid}` with an extra field `isAdmin: true` -> DENIED by `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`.
5. **Orphaned Meeting**: Creating `/meetings/mtg-1` referencing a non-existent `classId: "cls-missing"` -> DENIED by `classExists(...)`.
6. **Cross-Tenant List Scraping**: Listing `/classes` or `/meetings` without `where('ownerId', '==', uid)` -> DENIED by `allow list` check on `existing().ownerId`.
7. **PII Read Leak**: Reading `/users/{otherUid}/private/info` as a different signed-in user -> DENIED.
8. **Timestamp Forgery**: Creating `/meetings/mtg-1` with client-supplied `createdAt` not equal to `request.time` -> DENIED.
9. **Immutable Field Mutation**: Updating `/meetings/mtg-1` to change `classId` or `ownerId` -> DENIED.
10. **Terminal State Bypass**: Updating a meeting whose `status == 'completed'` -> DENIED.
11. **ID Poisoning**: Creating a document with an oversized (>128 char) or slash-containing ID -> DENIED by `isValidId(...)`.
12. **Array/String Resource Poisoning**: Creating a class with 50 syllabus topics or a 50KB description -> DENIED by `.size()` bounds.
