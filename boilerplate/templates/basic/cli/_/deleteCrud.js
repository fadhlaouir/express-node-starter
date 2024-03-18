const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');

/**
 * Function to check if an entity exists.
 * @param {string} entity - The entity to check existence for.
 * @returns {Promise<boolean>} - A Promise that resolves with true if the entity exists, false otherwise.
 */
async function isEntityExists(entity) {
  try {
    const modelPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'models',
      `${entity}.model.js`,
    );
    const controllerPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'controllers',
      `${entity}.controller.js`,
    );
    const routePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'routes',
      `${entity}.route.js`,
    );

    const [modelExists, controllerExists, routeExists] = await Promise.all([
      fs
        .access(modelPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(controllerPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(routePath)
        .then(() => true)
        .catch(() => false),
    ]);

    return modelExists && controllerExists && routeExists;
  } catch (error) {
    console.error('An error occurred while checking entity existence:', error);
    throw error;
  }
}

/**
 * Function to delete CRUD.
 * @param {string} entity - The entity to delete CRUD for.
 * @returns {Promise<void>} - A Promise that resolves when CRUD is deleted successfully.
 */
async function deleteCrud(entity) {
  try {
    // Check if entity exists
    const entityExists = await isEntityExists(entity);
    if (!entityExists) {
      console.log(`No CRUD found for entity: ${entity}`);
      return;
    }

    // Confirm deletion with user
    const confirmPrompt = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: `Are you sure you want to delete CRUD for entity '${entity}'?`,
    });

    if (!confirmPrompt.confirmed) {
      console.log('Deletion cancelled.');
      return;
    }

    // Define the paths for model, controller, and route files
    const modelPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'models',
      `${entity}.model.js`,
    );
    const controllerPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'controllers',
      `${entity}.controller.js`,
    );
    const routePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'routes',
      `${entity}.route.js`,
    );

    // Remove the model, controller, and route files
    await Promise.all([
      fs.unlink(modelPath),
      fs.unlink(controllerPath),
      fs.unlink(routePath),
    ]);

    // Remove routes reference from server.js
    const serverFilePath = path.join(__dirname, '..', '..', 'server.js');
    let serverFileContent = await fs.readFile(serverFilePath, 'utf-8');
    serverFileContent = serverFileContent.replace(
      `const ${entity}Routes = require('./src/routes/${entity}.route');\napp.use('/v1/api', ${entity}Routes);\n`,
      '',
    );
    await fs.writeFile(serverFilePath, serverFileContent);

    console.log('CRUD deleted successfully for entity:', entity);
  } catch (error) {
    console.error('An error occurred while deleting CRUD:', error);
    throw error;
  }
}

module.exports = { deleteCrud, isEntityExists };
