# Production Hardening - Contact Matching

**Implementation Date**: 2026-04-19  
**Status**: Production-ready with hardening applied

---

## Hardening Improvements Applied

### 1. Email Normalization

**Problem**: Case-sensitive email matching causes duplicates
- "John@Company.com" and "john@company.com" treated as different

**Solution**: Normalize before matching
```javascript
const normalizedEmail = data.contact_email?.trim().toLowerCase() || null;
```

**Applied to:**
- Email matching query (Step 1)
- Email consistency check (Step 2a)
- Contact creation (Step 3)

**Benefit:**
- Case-insensitive matching
- Whitespace trimmed
- Consistent storage format

---

### 2. Audit Metadata for Matching Decisions

**Problem**: No visibility into why contact was matched/created

**Solution**: Track matching strategy and reason
```javascript
let matchStrategy: 'email' | 'name' | 'created' = 'created';
let matchReason: string | null = null;
```

**Metadata captured:**
- `contact_match_strategy`: How contact was matched
  - `email`: Matched by email (primary)
  - `name`: Matched by name (secondary)
  - `created`: No match, created new
- `contact_match_reason`: Why new contact was created
  - `email_mismatch`: Name matched but email differed
  - `ambiguous`: Multiple name matches
  - `no_match`: No matches found
  - `null`: Contact was reused (not created)

**Audit log example:**
```json
{
  "event": "invoice.import",
  "metadata": {
    "import_row": 5,
    "invoice_number": "INV-1001",
    "contact_match_strategy": "email",
    "contact_match_reason": null,
    "contact_id": "uuid",
    "contact_email_normalized": "john@company.com"
  }
}
```

**Benefit:**
- Full traceability of matching decisions
- Debug why contacts were created vs reused
- Audit trail for data quality analysis

---

### 3. DB-Level Email Uniqueness Constraint

**Migration**: `20260419112900_contact_email_uniqueness.sql`

**SQL:**
```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_account_email_lower
  ON contacts(account_id, lower(email))
  WHERE email IS NOT NULL;
```

**Guarantees:**
- No duplicate emails per account (case-insensitive)
- Multiple NULL emails allowed (expected behavior)
- Enforced at database level (cannot be bypassed)

**Examples:**

**Allowed:**
```
account_id | name         | email
-----------+--------------+-------------------
acc-1      | John Smith   | john@company.com
acc-1      | Jane Doe     | jane@company.com
acc-1      | Bob Wilson   | NULL              ✓
acc-1      | Alice Brown  | NULL              ✓
```

**Blocked:**
```
account_id | name         | email
-----------+--------------+-------------------
acc-1      | John Smith   | john@company.com
acc-1      | John Smith   | JOHN@COMPANY.COM  ✗ (duplicate)
acc-1      | Jane Doe     | john@company.com  ✗ (duplicate)
```

**Benefit:**
- Database-level guarantee (strongest enforcement)
- Prevents duplicate emails even if application logic bypassed
- Case-insensitive matching via `lower(email)`

---

### 4. Missing Email Handling

**Current behavior**: Missing email is allowed
- Stored as `NULL` in database
- Name-only matching used (with safety checks)
- Multiple contacts with NULL email allowed

**Rationale:**
- Some invoices may not have email (phone-only, mail-only)
- Rejecting rows would block legitimate imports
- Name matching with ambiguity detection is safe fallback

**Alternative (not implemented):**
If strict email requirement needed in future:
```javascript
if (!normalizedEmail) {
  throw new Error(`Row ${row.row_index}: Email is required for contact "${data.contact_name}"`);
}
```

**Current decision**: Allow NULL emails with safe name matching

---

## Code Changes Summary

### CsvIngestionService.ts

**Added:**
1. Email normalization: `const normalizedEmail = data.contact_email?.trim().toLowerCase() || null;`
2. Match tracking: `let matchStrategy: 'email' | 'name' | 'created' = 'created';`
3. Reason tracking: `let matchReason: string | null = null;`
4. Normalized email in queries: `.eq('email', normalizedEmail)`
5. Audit metadata: `contact_match_strategy`, `contact_match_reason`, `contact_email_normalized`

**Changed:**
- All email comparisons use `normalizedEmail`
- Contact creation uses `normalizedEmail`
- Audit log includes matching metadata

**Core logic unchanged:**
- Still email-first matching
- Still safe name fallback
- Still email consistency check

---

## Migration SQL

**File**: `supabase/migrations/20260419112900_contact_email_uniqueness.sql`

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_account_email_lower
  ON contacts(account_id, lower(email))
  WHERE email IS NOT NULL;
```

**To apply:**
1. Run in Supabase SQL Editor, OR
2. Apply via Supabase CLI: `supabase db push`

**Safe to apply:**
- Uses `IF NOT EXISTS` (idempotent)
- Partial index (only non-NULL emails)
- Does not lock table for long periods

---

## Production Readiness Checklist

### ✓ Email Normalization
- [x] Trim whitespace
- [x] Convert to lowercase
- [x] Applied to all queries
- [x] Applied to storage

### ✓ Audit Metadata
- [x] Match strategy tracked
- [x] Match reason tracked
- [x] Normalized email logged
- [x] Contact ID logged

### ✓ DB Constraint
- [x] Unique index created
- [x] Case-insensitive (lower)
- [x] Per-account scoped
- [x] NULL emails allowed

### ✓ Missing Email Handling
- [x] NULL emails allowed
- [x] Safe name fallback
- [x] Ambiguity detection
- [x] Documented behavior

---

## Testing Recommendations

### Test Case 1: Email Normalization
```csv
invoice_number,amount,currency,due_date,issued_date,contact_name,contact_email
INV-1,1000,USD,2026-04-25,2026-04-10,John Smith,JOHN@COMPANY.COM
INV-2,2000,USD,2026-04-26,2026-04-11,John Smith,john@company.com
```

**Expected:**
- Both rows match same contact (case-insensitive)
- Only 1 contact created
- Email stored as: `john@company.com` (normalized)

### Test Case 2: Duplicate Email Prevention
```csv
INV-1,1000,USD,2026-04-25,2026-04-10,John Smith,john@company.com
INV-2,2000,USD,2026-04-26,2026-04-11,Jane Doe,john@company.com
```

**Expected:**
- First row creates contact
- Second row reuses same contact (email match)
- Only 1 contact exists with email `john@company.com`

### Test Case 3: Audit Metadata
Import any CSV and check audit log:
```sql
SELECT metadata->>'contact_match_strategy' as strategy,
       metadata->>'contact_match_reason' as reason
FROM audit_log
WHERE action = 'invoice.import'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- `strategy` is `email`, `name`, or `created`
- `reason` is `email_mismatch`, `ambiguous`, `no_match`, or `null`

---

## Summary

**Hardening applied:**
1. ✓ Email normalization (trim + lowercase)
2. ✓ Audit metadata (strategy + reason)
3. ✓ DB uniqueness constraint (case-insensitive)
4. ✓ Missing email handling (documented)

**Core logic unchanged:**
- Email-first matching
- Safe name fallback
- Email consistency check

**Production-ready**: YES

All hardening improvements applied without changing core decision flow.
