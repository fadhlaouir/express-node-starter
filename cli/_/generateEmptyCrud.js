/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// packages
const fs = require('fs').promises;
const path = require('path');

// local helpers
const { capitalizeEntity } = require('./helpers');

/* -------------------------------------------------------------------------- */
/*                             generate Empty Crud                            */
/* -------------------------------------------------------------------------- */
/**
 * Generates an empty CRUD (Create, Read, Update, Delete) skeleton for the specified entity.
 * @param {string} entity - The name of the entity for which CRUD operations will be generated.
 */
async function generateEmptyCrud(entity) {
  // Capitalize the first character of the entity name
  const ENTITY = capitalizeEntity(entity);

  // Generate model, controller, and route templates
  const modelTemplate = generateModelTemplate(ENTITY);
  const controllerTemplate = generateControllerTemplate(ENTITY, entity);
  const routeTemplate = generateRouteTemplate(ENTITY, entity);

  // Write model, controller, and route files
  await Promise.all([
    fs.writeFile(`src/models/${entity}.model.js`, modelTemplate),
    fs.writeFile(`src/controllers/${entity}.controller.js`, controllerTemplate),
    fs.writeFile(`src/routes/${entity}.route.js`, routeTemplate),
  ]);

  // Add route to server.js
  const lineToAdd = `const ${entity}Routes = require('./src/routes/${entity}.route');\napp.use('/v1/api', ${entity}Routes);\n`;
  try {
    const serverFilePath = path.join('server.js');
    let serverFileContent = await fs.readFile(serverFilePath, 'utf-8');
    let lines = serverFileContent.split('\n');
    lines.splice(47, 0, lineToAdd);
    serverFileContent = lines.join('\n');
    await fs.writeFile(serverFilePath, serverFileContent);
    console.log(`Added routes for ${entity} in server.js at line 48`);
  } catch (error) {
    console.error('Error appending route to server.js:', error);
  }
}

/* -------------------------------------------------------------------------- */
/*                           generate Model Template                          */
/* -------------------------------------------------------------------------- */
/**
 * Generates the template for the model file.
 * @param {string} entity - The name of the entity.
 * @returns {string} - The model template.
 */
function generateModelTemplate(entity) {
  return `
    const mongoose = require('mongoose');

    const ${entity}Schema = new mongoose.Schema({
      // Define schema fields here
    });

    module.exports = mongoose.model('${entity}', ${entity}Schema);
  `;
}

/* -------------------------------------------------------------------------- */
/*                        generate Controller Template                        */
/* -------------------------------------------------------------------------- */
/**
 * Generates the template for the controller file.
 * @param {string} entity - The name of the entity.
 * @param {string} originalEntity - The original, uncapitalized entity name.
 * @returns {string} - The controller template.
 */
function generateControllerTemplate(entity, originalEntity) {
  return `
    const ${entity} = require('../models/${originalEntity}.model');

    // Create CRUD operations
    async function create${entity}(req, res) {
      // Implement create operation
    }

    async function get${entity}(req, res) {
      // Implement read operation
    }

    async function update${entity}(req, res) {
      // Implement update operation
    }

    async function delete${entity}(req, res) {
      // Implement delete operation
    }

    module.exports = {
      create${entity},
      get${entity},
      update${entity},
      delete${entity},
    };
  `;
}

/* -------------------------------------------------------------------------- */
/*                           generate Route Template                          */
/* -------------------------------------------------------------------------- */
/**
 * Generates the template for the route file.
 * @param {string} entity - The name of the entity.
 * @param {string} originalEntity - The original, uncapitalized entity name.
 * @returns {string} - The route template.
 */
function generateRouteTemplate(entity, originalEntity) {
  return `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${originalEntity}.controller');

    // Define routes for ${entity} CRUD operations
    router.post('/${originalEntity}', ${entity}Controller.create${entity});
    router.get('/${originalEntity}s', ${entity}Controller.get${entity});
    router.put('/${originalEntity}s/:id', ${entity}Controller.update${entity});
    router.delete('/${originalEntity}s/:id', ${entity}Controller.delete${entity});

    module.exports = router;
  `;
}

module.exports = {
  generateEmptyCrud,
};
