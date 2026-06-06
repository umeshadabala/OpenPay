import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log('Dropping leftover columns...');

  // devices: drop device_token, status, last_sync_at
  console.log('\n[1] devices: drop device_token');
  try {
    await sql`ALTER TABLE devices DROP COLUMN IF EXISTS device_token;`;
    console.log('  ✓ Done');
  } catch (e: any) { console.log('  ⚠', e.message); }

  console.log('[2] devices: drop status');
  try {
    await sql`ALTER TABLE devices DROP COLUMN IF EXISTS status;`;
    console.log('  ✓ Done');
  } catch (e: any) { console.log('  ⚠', e.message); }

  console.log('[3] devices: drop last_sync_at');
  try {
    await sql`ALTER TABLE devices DROP COLUMN IF EXISTS last_sync_at;`;
    console.log('  ✓ Done');
  } catch (e: any) { console.log('  ⚠', e.message); }

  // ai_decisions: drop order_id, matched
  console.log('[4] ai_decisions: drop order_id');
  try {
    await sql`ALTER TABLE ai_decisions DROP COLUMN IF EXISTS order_id;`;
    console.log('  ✓ Done');
  } catch (e: any) { console.log('  ⚠', e.message); }

  console.log('[5] ai_decisions: drop matched');
  try {
    await sql`ALTER TABLE ai_decisions DROP COLUMN IF EXISTS matched;`;
    console.log('  ✓ Done');
  } catch (e: any) { console.log('  ⚠', e.message); }

  // Verify devices
  console.log('\n=== devices columns ===');
  const devCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='devices'
    ORDER BY ordinal_position;
  `;
  console.log(devCols.map(c => c.column_name).join(', '));

  // Verify ai_decisions
  console.log('\n=== ai_decisions columns ===');
  const aiCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='ai_decisions'
    ORDER BY ordinal_position;
  `;
  console.log(aiCols.map(c => c.column_name).join(', '));

  // Verify tables
  console.log('\n=== all tables ===');
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' ORDER BY table_name;
  `;
  console.log(tables.map(t => t.table_name).join(', '));

  console.log('\n✅ Cleanup complete!');
}

migrate().catch(console.error);
