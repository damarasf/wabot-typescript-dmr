// Test commands loading and categories
const fs = require('fs');
const path = require('path');

// Commands directory
const commandsDir = path.join(__dirname, '..', 'src', 'commands');

// Check if directory exists
if (!fs.existsSync(commandsDir)) {
  console.error('Commands directory not found at:', commandsDir);
  process.exit(1);
}

// List all command files
const commandFiles = fs.readdirSync(commandsDir)
  .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

console.log(`Found ${commandFiles.length} command files:\n`);

// Group categories
const categories = {};
const standardCategories = ['Umum', 'Grup', 'N8N', 'Utilitas', 'Admin', 'Owner'];
const categoryIssues = [];

// Parse each command file
commandFiles.forEach(file => {
  try {
    // Read file content
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
    
    // Extract command details using regex
    const nameMatch = content.match(/name:\s*['"](.*?)['"]/);
    const categoryMatch = content.match(/category:\s*['"](.*?)['"]/i);
    const descriptionMatch = content.match(/description:\s*['"](.*?)['"]/);
    const exportMatch = content.match(/export\s+default\s+(\w+)/);
    
    const name = nameMatch ? nameMatch[1] : 'Unknown';
    const category = categoryMatch ? categoryMatch[1] : 'Unknown';
    const description = descriptionMatch ? descriptionMatch[1] : '';
    const hasExport = !!exportMatch;
    
    // Check for category case issues
    if (category !== 'Unknown') {
      const standardCategory = standardCategories.find(
        c => c.toLowerCase() === category.toLowerCase()
      );
      
      if (standardCategory && standardCategory !== category) {
        categoryIssues.push({
          file,
          current: category,
          standard: standardCategory
        });
      }
    }
    
    // Add to categories
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push({ 
      name, 
      file, 
      description,
      hasExport
    });
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// Display commands by category
console.log('=== Commands by Category ===\n');

Object.keys(categories).sort().forEach(category => {
  console.log(`📂 ${category.toUpperCase()} (${categories[category].length} commands)`);
  
  // Sort commands within category
  categories[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
    const exportStatus = cmd.hasExport ? '✅' : '❌';
    console.log(`  ${exportStatus} ${cmd.name} (${cmd.file}): ${cmd.description}`);
  });
  
  console.log('');
});

// Display category issues if any
if (categoryIssues.length > 0) {
  console.log('\n=== Category Case Issues ===\n');
  categoryIssues.forEach(issue => {
    console.log(`❌ ${issue.file}: "${issue.current}" should be "${issue.standard}"`);
  });
  console.log('');
}

// Check for missing exports
const missingExports = [];
Object.values(categories).flat().forEach(cmd => {
  if (!cmd.hasExport) {
    missingExports.push(cmd.file);
  }
});

if (missingExports.length > 0) {
  console.log('\n=== Missing Exports ===\n');
  missingExports.forEach(file => {
    console.log(`❌ ${file} is missing "export default" statement`);
  });
  console.log('');
}

// Statistics
const totalCommands = Object.values(categories).reduce((sum, cmds) => sum + cmds.length, 0);
console.log(`Total Commands: ${totalCommands}`);
console.log(`Total Categories: ${Object.keys(categories).length}`);

// Return success or failure
if (categoryIssues.length > 0 || missingExports.length > 0) {
  console.log('\n❌ Test failed due to issues listed above');
  process.exit(1);
} else {
  console.log('\n✅ All commands are properly configured');
}
