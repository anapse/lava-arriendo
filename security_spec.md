# Security Specification: LavArrienda Management System

## 1. Data Invariants
1. A rental cannot be created without a valid washer ID, customer ID, start date, and end date.
2. A washer cannot be marked as available while assigned to an active unreturned rental.
3. Monetary amounts (pricePerDay, totalAmount, advancePayment, balanceDue) must be non-negative numbers.
4. Identifiers (washers, customers, rentals, payments, activities) must be alphanumeric with length <= 64 characters.
5. All operations are accessible by authenticated agency administrators and operators.
6. Activities are append-only audit trail logs.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Attempting to create a rental without authentication -> REJECT.
2. **Oversized String Injection**: Attempting to send a 2MB string in washer model -> REJECT.
3. **Negative Price Poisoning**: Creating a rental with pricePerDay = -50000 -> REJECT.
4. **Invalid Status Hijack**: Updating washer status to "destroyed_alien_tech" -> REJECT.
5. **Path Traversal in Doc ID**: Creating a doc with id `../../admin` -> REJECT.
6. **Negative Payment Amount**: Registering a payment of -200000 COP -> REJECT.
7. **Phantom Field Injection**: Adding `isAdmin: true` or ghost fields during client update -> REJECT.
8. **Null Date Record**: Creating a rental missing startDate -> REJECT.
9. **Missing Customer Document ID**: Registering a customer with blank documentId -> REJECT.
10. **Corrupted Phone Record**: Sending an array instead of string for phone -> REJECT.
11. **Premature Immutable Field Rewrite**: Overwriting rental `id` or `createdAt` -> REJECT.
12. **Malicious Activity Record Spoof**: Writing arbitrary untyped payloads into audit log -> REJECT.
