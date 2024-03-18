/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// Required packages
const inquirer = require('inquirer'); // For prompting user input

// Local helpers and functions
const { generateEmptyCrud } = require('./generateEmptyCrud'); // Function to generate empty CRUD
const { generateMinimalCrud } = require('./generateMinimalCrud'); // Function to generate minimal CRUD
const { isEntityExists } = require('./helpers'); // Function to check if entity already exists

/* -------------------------------------------------------------------------- */
/*                                   MAIN                                     */
/* -------------------------------------------------------------------------- */
/**
 * Main function to handle the CLI input and generate CRUD based on the user input.
 * It prompts the user for the entity name and CRUD type, performs validation,
 * checks if the entity already exists, and generates CRUD based on user input.
 * @returns {Promise<void>} - A Promise that resolves when CRUD is generated successfully
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);

    // Check if command is valid
    if (args.length < 1 || args[0] !== 'generate') {
      console.log('Invalid command. Use "generate" command.');
      process.exit(1);
    }

    // Prompt user to enter entity name
    const entityPrompt = {
      type: 'input',
      name: 'entity',
      message: 'Enter entity name:',
      validate: async (input) => {
        // Trim leading and trailing whitespace
        const trimmedInput = input.trim();

        // Check if entity name is empty after trimming
        if (!trimmedInput) {
          return 'Entity name cannot be empty';
        }

        // Check if entity name contains only alphanumeric characters and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedInput)) {
          return 'Entity name can only contain letters, numbers, and underscores';
        }

        // Check if entity name already exists
        const entityExists = await isEntityExists(trimmedInput);
        if (entityExists) {
          return `Entity "${trimmedInput}" already exists. Cannot generate CRUD.`;
        }

        // Validation passed
        return true;
      },
    };

    // Get entity name from user input
    const { entity } = await inquirer.prompt(entityPrompt);

    // Prompt user to select CRUD type
    const commandPrompt = {
      type: 'list',
      name: 'command',
      message: 'Select CRUD type:',
      choices: ['empty', 'minimal'],
    };

    // Get CRUD type from user input
    const { command } = await inquirer.prompt(commandPrompt);

    // Generate CRUD based on user input
    switch (command) {
      case 'empty':
        await generateEmptyCrud(entity, generateEmptyCrud);
        console.log('Empty CRUD generated successfully for entity:', entity);
        break;
      case 'minimal':
        await generateMinimalCrud(entity, generateMinimalCrud);
        console.log('Minimal CRUD generated successfully for entity:', entity);
        break;
      default:
        console.log('Invalid command:', command);
        process.exit(1);
    }
  } catch (error) {
    // Handle errors
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Invoke main function
main();
