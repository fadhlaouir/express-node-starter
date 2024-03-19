#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// Required packages
const inquirer = require('inquirer'); // For prompting user input
const util = require('util');
const exec = util.promisify(require('child_process').exec); // For executing shell commands

// Local helpers and functions
const { generateEmptyCrud } = require('./_/generateEmptyCrud'); // Function to generate empty CRUD
const { generateMinimalCrud } = require('./_/generateMinimalCrud'); // Function to generate minimal CRUD
const { deleteCrud } = require('./_/deleteCrud'); // Function to delete CRUD
const { isEntityExists } = require('./_/helpers'); // Function to check if entity already exists

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */
const LOADING_EMOJI = '⏳'; // Loading emoji

/* -------------------------------------------------------------------------- */
/*                                   MAIN                                     */
/* -------------------------------------------------------------------------- */
/**
 * Main function to handle the CLI input for generating or deleting CRUD operations.
 * It prompts the user for the action to perform and handles the corresponding action.
 * @returns {Promise<void>} - A Promise that resolves when the action is performed successfully
 */
async function main() {
  try {
    // Interactive prompt for selecting action
    const actionPrompt = {
      type: 'list',
      name: 'action',
      message: 'Select action:',
      choices: ['Generate CRUD', 'Delete CRUD', 'Exit'],
    };

    const { action } = await inquirer.prompt(actionPrompt);

    switch (action) {
      case 'Generate CRUD':
        console.log(`${LOADING_EMOJI} Generating CRUD...`);
        await generateCrud();
        break;
      case 'Delete CRUD':
        console.log(`${LOADING_EMOJI} Deleting CRUD...`);
        await deleteCrudAction();
        break;
      case 'Exit':
        console.log('Exiting...');
        process.exit(0);
        break;
      default:
        console.log('Invalid action:', action);
        process.exit(1);
    }
  } catch (error) {
    // Handle errors
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

/**
 * Function to handle the CRUD generation process.
 * @returns {Promise<void>} - A Promise that resolves when CRUD is generated successfully
 */
async function generateCrud() {
  try {
    // Prompt user to enter entity name
    const entityPrompt = {
      type: 'input',
      name: 'entity',
      message: 'Enter entity name:',
      validate: async (input) => {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
          return 'Entity name cannot be empty';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedInput)) {
          return 'Entity name can only contain letters, numbers, and underscores';
        }
        const entityExists = await isEntityExists(trimmedInput);
        if (entityExists) {
          return `Entity "${trimmedInput}" already exists. Cannot generate CRUD.`;
        }
        return true;
      },
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
        console.log('✅ Empty CRUD generated successfully for entity:', entity);
        break;
      case 'minimal':
        await generateMinimalCrud(entity);
        console.log(
          '✅ Minimal CRUD generated successfully for entity:',
          entity,
        );
        break;
      default:
        console.log('Invalid command:', command);
        process.exit(1);
    }

    // Run 'npm run format:fix' after CRUD operations are performed
    await exec('npm run format:fix');
    console.log('✅ Formatting fixed.');
    console.log('Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during CRUD generation:', error);
    process.exit(1);
  }
}

/**
 * Function to handle the CRUD deletion process.
 * @returns {Promise<void>} - A Promise that resolves when CRUD is deleted successfully
 */
async function deleteCrudAction() {
  try {
    // Prompt user to enter entity name for deletion
    const entityPrompt = {
      type: 'input',
      name: 'entity',
      message: 'Enter entity name to delete CRUD:',
      validate: async (input) => {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
          return 'Entity name cannot be empty';
        }
        return true;
      },
    };

    const { entity } = await inquirer.prompt(entityPrompt);
    await deleteCrud(entity);
    console.log('✅ CRUD for entity', entity, 'deleted successfully.');

    // Run 'npm run format:fix' after CRUD operations are performed
    await exec('npm run format:fix');
    console.log('✅ Formatting fixed.');
    console.log('Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during CRUD deletion:', error);
    process.exit(1);
  }
}

// Invoke main function if the script is run directly
if (require.main === module) {
  main();
}

module.exports = { generateCrud, deleteCrudAction };
