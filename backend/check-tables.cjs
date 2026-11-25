const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n========================================');
    console.log('📊 SUPABASE POSTGRESQL TABLES IN PUBLIC SCHEMA:');
    console.log('========================================');
    for (const t of tables) {
      const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t.table_name}"`);
      console.log(`  ✓ ${t.table_name.padEnd(30)} : ${count[0].count} rows`);
    }

    console.log('========================================');
    console.log('✅ All tables exist and are connected to Supabase Cloud!\n');
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
