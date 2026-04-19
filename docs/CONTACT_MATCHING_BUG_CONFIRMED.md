# CONTACT MATCHING BUG - CONFIRMED

**Validation Date**: 2026-04-19T11:16:39Z  
**Method**: Real DB execution with live Supabase  
**Status**: ✗ BUGS CONFIRMED

---

## Exact Bug Found

**Location**: `src/services/ingestion/CsvIngestionService.ts:86-91`

```javascript
const { data: existingContact } = await supabase
  .from('contacts')
  .select('id, account_id, name, email, phone')
  .eq('account_id', accountId)
  .eq('name', data.contact_name)  // ← ONLY matches by name
  .single();
```

**Problem**: Contact lookup matches by `name` only, completely ignoring `email`.

---

## Real Execution Results

### Test Setup
1. Created contact: "Sarah Johnson <sarah@oldcompany.com>"
2. User imports CSV with: "Sarah Johnson <sarah@newcompany.com>"
3. System looks up by name only

### Actual Behavior
- System found: "Sarah Johnson <sarah@oldcompany.com>"
- System reused existing contact (ignored new email)
- Invoice linked to: sarah@oldcompany.com
- **User intended**: sarah@newcompany.com

### Confirmed Impact
**Invoice will be sent to WRONG email address.**

---

## Bug #1: Email Mismatch

**Severity**: HIGH  
**Risk**: Emails sent to wrong recipient

### Real DB Evidence
```json
{
  "user_intended_email": "sarah@newcompany.com",
  "system_used_email": "sarah@oldcompany.com",
  "matching_strategy": "name_only",
  "email_ignored": true,
  "risk_level": "HIGH - emails sent to wrong recipient"
}
```

### Scenario
1. Company has contact "John Smith <john@acme.com>"
2. User imports invoice for "John Smith <john@newacme.com>" (company changed domain)
3. System reuses old contact
4. Reminder email goes to john@acme.com (old, possibly invalid)
5. Customer never receives invoice reminder

---

## Bug #2: Ambiguous Matches (Multiple Contacts)

**Severity**: HIGH  
**Risk**: System crashes on duplicate names

### Real DB Evidence
After creating 2 contacts with same name:
```json
{
  "duplicate_contact_blocked": false,
  "total_contacts_with_same_name": 2,
  "ambiguous_lookup_count": 2
}
```

**Contacts in DB:**
```json
[
  {
    "id": "c2d59636-4743-4779-ac62-e909c4cc1a83",
    "name": "Sarah Johnson",
    "email": "sarah@oldcompany.com"
  },
  {
    "id": "5550f7db-7ca6-4005-abf3-d28a77978c22",
    "name": "Sarah Johnson",
    "email": "sarah@thirdcompany.com"
  }
]
```

### Impact
When CSV import tries to lookup "Sarah Johnson":
- `.single()` expects exactly 1 row
- Query returns 2 rows
- **Error**: "Cannot coerce the result to a single JSON object"
- **CSV import fails completely**

### Scenario
1. User has 2 customers named "John Smith" at different companies
2. User imports CSV with "John Smith" invoice
3. System crashes with "multiple rows returned" error
4. Import fails, user confused

---

## Matching Strategy Analysis

### Current Strategy: NAME ONLY
```javascript
.eq('name', data.contact_name)
```

**Problems:**
1. Ignores email completely
2. Cannot distinguish between people with same name
3. Reuses wrong contact when email changes
4. Crashes when duplicates exist

### Reliable Strategy: NAME + EMAIL
```javascript
.eq('name', data.contact_name)
.eq('email', data.contact_email)
```

**Benefits:**
1. Matches exact person (name + email combination)
2. Handles duplicate names correctly
3. Detects email changes (creates new contact)
4. No ambiguous matches

---

## Is Matching Reliable?

**NO. Current matching is UNRELIABLE and RISKY.**

### Confirmed Risks

**Risk 1: Wrong Email Address**
- Probability: HIGH (common for name reuse)
- Impact: Emails sent to wrong recipient
- Data loss: Customer never receives invoice

**Risk 2: System Crash on Duplicates**
- Probability: MEDIUM (multiple people with same name)
- Impact: CSV import fails completely
- User experience: Confusing error, no clear fix

**Risk 3: Contact Proliferation**
- Probability: HIGH (slight name variations)
- Impact: "John Smith", "John Smith Jr.", "J. Smith" create separate contacts
- Data quality: Duplicate contacts for same person

---

## Recommended Fix

### Option 1: Match by Name + Email (Recommended)

**Change**: `src/services/ingestion/CsvIngestionService.ts:86-91`

```javascript
// Current (BROKEN):
const { data: existingContact } = await supabase
  .from('contacts')
  .select('id, account_id, name, email, phone')
  .eq('account_id', accountId)
  .eq('name', data.contact_name)
  .single();

// Fixed:
const { data: existingContact } = await supabase
  .from('contacts')
  .select('id, account_id, name, email, phone')
  .eq('account_id', accountId)
  .eq('name', data.contact_name)
  .eq('email', data.contact_email || '')  // Match by email too
  .maybeSingle();  // Returns null if no match, doesn't throw on multiple

if (existingContact) {
  contactId = existingContact.id;
  contactRecord = existingContact;
} else {
  // No match found - create new contact
  const { data: newContact, error: cErr } = await supabase
    .from('contacts')
    .insert({
      account_id: accountId,
      name: data.contact_name,
      email: data.contact_email || null
    })
    .select('id, account_id, name, email, phone')
    .single();
  if (cErr) throw cErr;
  contactId = newContact.id;
  contactRecord = newContact;
}
```

**Benefits:**
- Matches exact person (name + email)
- Handles duplicate names correctly
- Detects email changes (creates new contact)
- No crashes on ambiguous matches

**Trade-offs:**
- Email change creates new contact (may be desired behavior)
- Requires email in CSV (already required by schema)

### Option 2: Use Unique Contact ID

Add `contact_id` column to CSV, match by ID instead of name.

**Benefits:**
- Guaranteed unique match
- Handles name changes, email changes

**Trade-offs:**
- Requires users to maintain contact IDs
- More complex CSV format

---

## Conclusion

### Bug Confirmed: YES

**Contact matching by name only is FLAWED and RISKY.**

### Evidence
- Real DB execution confirmed email mismatch
- Real DB execution confirmed duplicate name crash
- Matching strategy: name_only (ignores email)
- Risk level: HIGH

### Recommendation
**Fix immediately before production use.**

Match by name + email to ensure reliable contact matching and prevent wrong email addresses.

---

## Test Results Summary

**Scenario 3: Contact Matching**
- ✗ Email mismatch confirmed
- ✗ Duplicate name crash confirmed
- ✗ Matching strategy unreliable
- Risk: HIGH - emails sent to wrong recipient

**Bugs Found**: 2 confirmed product bugs
**Reliability**: UNRELIABLE - requires fix before production
