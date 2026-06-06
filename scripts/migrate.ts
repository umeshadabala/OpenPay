import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log('Starting migration...');

  // 1. merchant_profiles: rename merchant_id_token -> merchant_code
  console.log('\n[1/7] merchant_profiles: renaming merchant_id_token -> merchant_code');
  try {
    await sql`ALTER TABLE merchant_profiles RENAME COLUMN merchant_id_token TO merchant_code;`;
    console.log('  ✓ Done');
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      console.log('  ⏩ Column already renamed or does not exist, skipping.');
    } else {
      console.log('  ⚠ Error:', e.message);
    }
  }

  // 2. devices: drop columns device_token, status, last_sync_at (not in new schema)
  console.log('\n[2/7] devices: dropping unused columns device_token, status, last_sync_at');
  for (const col of ['device_token', 'status', 'last_sync_at']) {
    try {
      await sql`ALTER TABLE devices DROP COLUMN IF EXISTS ${sql(col)};`;
      console.log(`  ✓ Dropped ${col}`);
    } catch (e: any) {
      console.log(`  ⚠ Error dropping ${col}:`, e.message);
    }
  }

  // 3. transactions.amount: make nullable (schema has it nullable)
  console.log('\n[3/7] transactions: making amount nullable');
  try {
    await sql`ALTER TABLE transactions ALTER COLUMN amount DROP NOT NULL;`;
    console.log('  ✓ Done');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  // 4. ai_decisions: drop old columns, add new ones
  console.log('\n[4/7] ai_decisions: restructuring columns');
  
  // Drop old columns
  for (const col of ['order_id', 'matched']) {
    try {
      await sql`ALTER TABLE ai_decisions DROP COLUMN IF EXISTS ${sql(col)};`;
      console.log(`  ✓ Dropped ${col}`);
    } catch (e: any) {
      console.log(`  ⚠ Error dropping ${col}:`, e.message);
    }
  }

  // Add new columns
  console.log('  Adding is_credit column...');
  try {
    await sql`ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS is_credit boolean NOT NULL DEFAULT false;`;
    console.log('  ✓ Added is_credit');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  console.log('  Adding parsed_amount column...');
  try {
    await sql`ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS parsed_amount numeric(10, 2);`;
    console.log('  ✓ Added parsed_amount');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  console.log('  Adding parsed_utr column...');
  try {
    await sql`ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS parsed_utr text;`;
    console.log('  ✓ Added parsed_utr');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  console.log('  Adding parsed_sender column...');
  try {
    await sql`ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS parsed_sender text;`;
    console.log('  ✓ Added parsed_sender');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  // 5. Drop orders table (no longer needed)
  console.log('\n[5/7] Dropping orders table');
  try {
    await sql`DROP TABLE IF EXISTS orders CASCADE;`;
    console.log('  ✓ Done');
  } catch (e: any) {
    console.log('  ⚠ Error:', e.message);
  }

  // 6. Verify final state
  console.log('\n[6/7] Verifying merchant_profiles columns...');
  const mpCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'merchant_profiles'
    ORDER BY ordinal_position;
  `;
  console.log('  Columns:', mpCols.map(c => c.column_name).join(', '));

  console.log('\n[7/7] Verifying ai_decisions columns...');
  const aiCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_decisions'
    ORDER BY ordinal_position;
  `;
  console.log('  Columns:', aiCols.map(c => c.column_name).join(', '));

  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
