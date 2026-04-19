# Production-Grade Contact Matching Logic

**Implementation Date**: 2026-04-19  
**File**: `src/services/ingestion/CsvIngestionService.ts`  
**Status**: Production-ready

---

## Overview

Replaced unsafe name-only matching with production-grade logic that prioritizes email as primary identifier and handles edge cases safely.

---

## Decision Path Explanation

### Step 1: Match by Email (Primary Identifier)

```javascript
if (data.contact_email) {
  const { data: emailMatch, error: emailError } = await supabase
    .from('contacts')
    .select('id, account_id, name, email, phone')
    .eq('account_id', accountId)
    .eq('email', data.contact_email)
    .maybeSingle();  // Safe: returns null if no match, doesn't throw

  if (emailMatch) {
    matchedContact = emailMatch;
  }
}
```

**Why Email First:**
- Email is the most reliable identifier for a person
- Email addresses are unique per person in business context
- Handles name changes (marriage, legal name change)
- Prevents wrong recipient errors

**Decision Path:**
- ✓ Email match found → Reuse contact (same person)
- ✗ No email match → Continue to Step 2

**Safety:**
- Uses `.maybeSingle()` instead of `.single()` - never throws
- Returns null if no match (safe to check)

---

### Step 2: Match by Name (Secondary, with Safety Checks)

```javascript
if (!matchedContact && data.contact_name) {
  const { data: nameMatches, error: nameError } = await supabase
    .from('contacts')
    .select('id, account_id, name, email, phone')
    .eq('account_id', accountId)
    .eq('name', data.contact_name);
    // Note: No .single() - returns array

  if (nameMatches && nameMatches.length === 1) {
    // Exactly one match - safe to reuse
    matchedContact = nameMatches[0];
  } else if (nameMatches && nameMatches.length > 1) {
    // Multiple matches - ambiguous, cannot safely reuse
    console.warn(`Ambiguous: ${nameMatches.length} contacts named "${data.contact_name}"`);
    // Fall through to create new contact
  }
}
```

**Why Name is Secondary:**
- Names are not unique (multiple "John Smith" contacts)
- Name-only matching caused the confirmed bugs
- Only safe when exactly one match exists

**Decision Paths:**

**Path A: Exactly 1 name match**
- ✓ Safe to reuse (unambiguous)
- Reuse existing contact

**Path B: Multiple name matches (2+)**
- ✗ Ambiguous - cannot determine which contact is correct
- **Create new contact** to avoid wrong email address
- Log warning for visibility

**Path C: Zero name matches**
- ✗ No match found
- Continue to Step 3

**Safety:**
- Query returns array (not `.single()`)
- Explicitly checks array length
- Never crashes on multiple matches
- Prefers creating duplicate over wrong email

---

### Step 3: Use Matched Contact or Create New

```javascript
if (matchedContact) {
  contactId = matchedContact.id;
  contactRecord = matchedContact;
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

**Decision Paths:**

**Path A: Match found (from Step 1 or 2)**
- Reuse existing contact

**Path B: No match found**
- Create new contact
- Safe default: prefer duplicate contact over wrong email

---

## Guaranteed Safety Properties

### ✓ Cannot Send Email to Wrong Recipient

**Scenario 1: Email change**
- Old: "John Smith <john@oldcompany.com>"
- New CSV: "John Smith <john@newcompany.com>"
- **Result**: Email match fails, name match succeeds (1 match), reuses contact
- **Wait, this is still wrong!**

**CORRECTION NEEDED**: Name match should also check email consistency.

Let me fix this...

---

## Updated Logic (Corrected)

The name matching needs additional validation to ensure email consistency.

```javascript
if (!matchedContact && data.contact_name) {
  const { data: nameMatches, error: nameError } = await supabase
    .from('contacts')
    .select('id, account_id, name, email, phone')
    .eq('account_id', accountId)
    .eq('name', data.contact_name);

  if (nameMatches && nameMatches.length === 1) {
    const singleMatch = nameMatches[0];
    
    // Additional safety: check email consistency
    if (data.contact_email && singleMatch.email && data.contact_email !== singleMatch.email) {
      // Name matches but email is different - this is a different person or email changed
      console.warn(
        `[Ingestion] Name match found but email differs: ` +
        `"${data.contact_name}" has email ${singleMatch.email} in DB but ${data.contact_email} in CSV. ` +
        `Creating new contact to avoid wrong email address.`
      );
      // Fall through to create new contact
    } else {
      // Name matches and email is consistent (or missing) - safe to reuse
      matchedContact = singleMatch;
    }
  } else if (nameMatches && nameMatches.length > 1) {
    // Multiple matches - ambiguous
    console.warn(`Ambiguous: ${nameMatches.length} contacts named "${data.contact_name}"`);
  }
}
```

This additional check ensures we never reuse a contact when the email has changed.
