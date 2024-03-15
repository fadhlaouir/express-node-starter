const fs = require('fs').promises;
const path = require('path');

async function generateEmptyCrud(entity) {
  // Ensure the first character of the entity name is uppercase
  const ENTITY = entity.charAt(0).toUpperCase() + entity.slice(1);

  /**
   * modelTemplate is a string that contains the template for the model file.
   * It uses the entity name to create the model file.
   * The model file is created in the src/models directory.
   */
  const modelTemplate = `
    const mongoose = require('mongoose');

    const ${ENTITY}Schema = new mongoose.Schema({
      // Define schema fields here
    });

    module.exports = mongoose.model('${ENTITY}', ${ENTITY}Schema);
  `;

  const controllerTemplate = `
    const ${ENTITY} = require('../models/${entity}.model');

    // Create CRUD operations
    async function create${ENTITY}(req, res) {
      // Implement create operation
    }

    async function get${ENTITY}(req, res) {
      // Implement read operation
    }

    async function update${ENTITY}(req, res) {
      // Implement update operation
    }

    async function delete${ENTITY}(req, res) {
      // Implement delete operation
    }

    module.exports = {
      create${ENTITY},
      get${ENTITY},
      update${ENTITY},
      delete${ENTITY},
    };
  `;

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${ENTITY}Controller = require('../controllers/${entity}.controller');

    // Define routes for ${ENTITY} CRUD operations
    router.post('/${entity}', ${ENTITY}Controller.create${ENTITY});
    router.get('/${entity}s', ${ENTITY}Controller.get${ENTITY});
    router.put('/${entity}s/:id', ${ENTITY}Controller.update${ENTITY});
    router.delete('/${entity}s/:id', ${ENTITY}Controller.delete${ENTITY});

    module.exports = router;
  `;

  await fs.writeFile(`src/models/${entity}.model.js`, modelTemplate);
  await fs.writeFile(
    `src/controllers/${entity}.controller.js`,
    controllerTemplate,
  );
  await fs.writeFile(`src/routes/${entity}.route.js`, routeTemplate);

  // Line to add in server.js
  const lineToAdd = `const ${entity}Routes = require('./src/routes/${entity}.route');\napp.use('/v1/api', ${entity}Routes);\n`;

  try {
    // Append the line to server.js
    const serverFilePath = path.join('server.js');
    await fs.appendFile(serverFilePath, lineToAdd);
    console.log(`Added routes for ${entity} in server.js`);
  } catch (error) {
    console.error('Error appending route to server.js:', error);
  }
}

module.exports = {
  generateEmptyCrud,
};
