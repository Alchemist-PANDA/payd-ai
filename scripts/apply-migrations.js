/**
 * Apply Database Migrations
 *
 * Runs all SQL migrations against Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(url, key);

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log(`Found ${files.length} migration files\n`);

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;

    console.log(`Applying: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      // Note: Supabase JS client doesn't support raw SQL execution with anon key
      // This requires service role key or Supabase CLI
      console.log('⚠️  Cannot apply migrations with anon key');
      console.log('⚠️  Migrations require service role key or Supabase CLI\n');
      console.log('Please apply migrations using one of these methods:\n');
      console.log('1. Supabase Dashboard:');
      console.log('   - Go to SQL Editor');
      console.log('   - Copy/paste each migration file');
      console.log('   - Run in order\n');
      console.log('2. Supabase CLI:');
      console.log('   - Install: npm install -g supabase');
      console.log('   - Link project: supabase link --project-ref ewcuhsoylempdbnmegqo');
      console.log('   - Apply: supabase db push\n');
      console.log('Migration files to apply (in order):');
      files.forEach(f => console.log(`   - ${f}`));
      process.exit(1);
    } catch (error) {
      console.error(`❌ Failed to apply ${file}:`, error.message);
      process.exit(1);
    }
  }
}

applyMigrations();
