import sequelize from './src/database/config/database';

async function checkTables() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Get all table names
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
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
      console.log('\nRecommendation: Drop the PascalCase tables manually after ensuring data is in lowercase tables.');
    } else {
      console.log('\n✅ No duplicate tables found.');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
