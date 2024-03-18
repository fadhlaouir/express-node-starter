const fs = require('fs').promises;
const path = require('path');

/**
 * Function to delete CRUD.
 * @param {string} entity - The entity to delete CRUD for.
 * @returns {Promise<void>} - A Promise that resolves when CRUD is deleted successfully
 */
async function deleteCrud(entity) {
  try {
    // Define the paths for model, controller, and route files
    const modelPath = path.join(
      __dirname,
      '..',
      'src',
      'models',
      `${entity}.model.js`,
    );
    const controllerPath = path.join(
      __dirname,
      '..',
      'src',
      'controllers',
      `${entity}.controller.js`,
    );
    const routePath = path.join(
      __dirname,
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
    const serverFilePath = path.join(__dirname, '..', 'server.js');
    let serverFileContent = await fs.readFile(serverFilePath, 'utf-8');
    serverFileContent = serverFileContent.replace(
      `const ${entity}Routes = require('./src/routes/${entity}.route');\napp.use('/v1/api', ${entity}Routes);\n`,
      '',
    );
    await fs.writeFile(serverFilePath, serverFileContent);

    console.log('CRUD deleted successfully for entity:', entity);
  } catch (error) {
    // Handle errors
    console.error('An error occurred while deleting CRUD:', error);
    throw error;
  }
}

module.exports = { deleteCrud };
