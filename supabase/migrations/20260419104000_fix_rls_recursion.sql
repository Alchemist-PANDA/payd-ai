-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to fix the circular dependency

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Tenant access: accounts" ON accounts;
DROP POLICY IF EXISTS "Tenant access: memberships" ON memberships;

-- Fix: accounts policy should not reference memberships
-- Instead, allow all authenticated users to read accounts they're members of
CREATE POLICY "Tenant access: accounts"
  ON accounts
  FOR ALL
  USING (
    id IN (
      SELECT account_id
      FROM memberships
      WHERE user_id = auth.uid()
    )
  );

-- Fix: memberships policy should directly check user_id
CREATE POLICY "Tenant access: memberships"
  ON memberships
  FOR ALL
  USING (user_id = auth.uid());
