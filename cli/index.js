const { generateEmptyCrud } = require('./generateEmptyCrud');
const { generateMinimalCrud } = require('./generateMinimalCrud');
const inquirer = require('inquirer');

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length < 1) {
      console.log('Usage: node index.js generate <entity>');
      process.exit(1);
    }

    if (args[0] !== 'generate') {
      console.log('Invalid command. Use "generate" command.');
      process.exit(1);
    }

    const entityPrompt = {
      type: 'input',
      name: 'entity',
      message: 'Enter entity name:',
      validate: (input) => !!input.trim() || 'Entity name cannot be empty',
    };

    const { entity } = await inquirer.prompt(entityPrompt);

    const commandPrompt = {
      type: 'list',
      name: 'command',
      message: 'Select CRUD type:',
      choices: ['empty', 'minimal'],
    };

    const { command } = await inquirer.prompt(commandPrompt);

    switch (command) {
      case 'empty':
        await generateEmptyCrud(entity);
        console.log('Empty CRUD generated successfully for entity:', entity);
        break;
      case 'minimal':
        await generateMinimalCrud(entity);
        console.log('Minimal CRUD generated successfully for entity:', entity);
        break;
      default:
        console.log('Invalid command:', command);
        process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
