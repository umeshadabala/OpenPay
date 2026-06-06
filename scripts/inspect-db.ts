import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  // List all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('=== EXISTING TABLES ===');
  for (const t of tables) {
    console.log(' -', t.table_name);
  }

  // For each table, list columns
  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position;
    `;
    console.log(`\n=== ${t.table_name} ===`);
    for (const c of cols) {
      console.log(`  ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`);
    }
  }
}

main().catch(console.error);
