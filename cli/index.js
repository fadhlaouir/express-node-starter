const { generateEmptyCrud, generateMinimalCrud } = require('./generateCrud');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node index.js <command> <entity>');
  console.log('Commands:');
  console.log('  empty    Generate CRUD with empty placeholders');
  console.log('  minimal  Generate minimal CRUD with basic structure');
  process.exit(1);
}

const command = args[0];
const entity = args[1];

if (command === 'empty') {
  generateEmptyCrud(entity)
    .then(() => console.log('Empty CRUD generated successfully!'))
    .catch((err) => console.error('Error generating empty CRUD:', err));
} else if (command === 'minimal') {
  generateMinimalCrud(entity)
    .then(() => console.log('Minimal CRUD generated successfully!'))
    .catch((err) => console.error('Error generating minimal CRUD:', err));
} else {
  console.log('Invalid command:', command);
  process.exit(1);
}
