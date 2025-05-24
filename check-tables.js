const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'wabot_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Get all table names from public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    console.log('\nCurrent tables in database:');
    tables.forEach(table => {
      console.log(`- ${table}`);
    });
    
    // Check for duplicate tables (PascalCase vs lowercase)
    const duplicates = [];
    const lowerCaseTables = tables.filter(table => table.toLowerCase() === table);
    const pascalCaseTables = tables.filter(table => table !== table.toLowerCase());
    
    pascalCaseTables.forEach(pascalTable => {
      const lowerVersion = pascalTable.toLowerCase();
      if (lowerCaseTables.includes(lowerVersion)) {
        duplicates.push({ pascal: pascalTable, lower: lowerVersion });
      }
    });
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  Found duplicate tables:');
      duplicates.forEach(dup => {
        console.log(`- ${dup.pascal} and ${dup.lower}`);
      });
      console.log('\nYou should drop the PascalCase tables manually after ensuring data is in lowercase tables.');
      
      // Generate DROP statements
      console.log('\nGenerated DROP statements (run these manually if needed):');
      duplicates.forEach(dup => {
        console.log(`DROP TABLE IF EXISTS "${dup.pascal}" CASCADE;`);
      });
    } else {
      console.log('\n✅ No duplicate tables found. All tables are using lowercase naming.');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
