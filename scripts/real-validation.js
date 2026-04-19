#!/usr/bin/env node

/**
 * Real End-to-End Validation Script
 *
 * This script performs REAL validation with live Supabase connection.
 * NOT simulation - actual DB queries and data verification.
 *
 * IMPORTANT: Uses service role key to bypass RLS for validation.
 * Service role key should NEVER be used in frontend code.
 *
 * Usage (Windows CMD):
 *   set NEXT_PUBLIC_SUPABASE_URL=your_url
 *   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   node scripts\real-validation.js
 */

async function main() {
  console.log('='.repeat(80));
  console.log('REAL END-TO-END VALIDATION');
  console.log('='.repeat(80));
  console.log('\nValidation Date: 2026-04-19');
  console.log('This script performs REAL DB operations (not simulation)');
  console.log('Uses service role key to bypass RLS for validation\n');

  // Check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables\n');
    console.log('Required:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (server-side only, never in frontend)\n');
    console.log('Windows CMD usage:');
    console.log('  set NEXT_PUBLIC_SUPABASE_URL=your_url');
    console.log('  set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    console.log('  node scripts\\real-validation.js\n');
    console.log('⚠️  IMPORTANT: Service role key bypasses RLS.');
    console.log('   Use only for server-side validation, never in frontend code.\n');
    process.exit(1);
  }

  console.log('✓ Credentials loaded from environment');
  console.log('✓ Starting real validation...\n');

  // Import and run validation after credentials are set
  const { runRealValidation } = require('./real-validation-runner');
  await runRealValidation();
}

main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
