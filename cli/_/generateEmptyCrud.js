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
 * This function generates a basic Mongoose schema and model template
 * for a given entity.
 * @param {string} entity - The name of the entity.
 * @returns {string} - The model template.
 */
function generateModelTemplate(entity) {
  // Template for the model file
  return `
  /* -------------------------------------------------------------------------- */
  /*                                DEPENDENCIES                                */
  /* -------------------------------------------------------------------------- */
  // packages
    const mongoose = require('mongoose');

/* -------------------------------------------------------------------------- */
/*                              SCHEMA DEFINITION                             */
/* -------------------------------------------------------------------------- */
    /**
     * Schema definition for ${entity}.
     * This schema defines the structure of the ${entity} entity in the database.
     */
    const ${entity}Schema = new mongoose.Schema({
      // Define schema fields here
      fieldName: {
        type: String,
        required: true, // Example of a required field
      }
    });

    /**
     * Model for ${entity}.
     * This model represents the ${entity} entity in the database and provides
     * methods for interacting with ${entity} documents.
     */
    module.exports = mongoose.model('${entity}', ${entity}Schema);
  `;
}

/* -------------------------------------------------------------------------- */
/*                        generate Controller Template                        */
/* -------------------------------------------------------------------------- */
/**
 * Generates the template for the controller file.
 * This function generates a basic CRUD (Create, Read, Update, Delete) operations template
 * for a given entity.
 * @param {string} entity - The name of the entity.
 * @param {string} originalEntity - The original, uncapitalized entity name.
 * @returns {string} - The controller template.
 */
function generateControllerTemplate(entity, originalEntity) {
  return `
  /* -------------------------------------------------------------------------- */
  /*                                DEPENDENCIES                                */
  /* -------------------------------------------------------------------------- */
  // local models
    const ${entity} = require('../models/${originalEntity}.model');

    /* -------------------------------------------------------------------------- */
    /*                            CONTROLLER FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */
    /**
     * Creates a new ${entity}.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>} - Promise representing the operation completion.
     */
    async function create${entity}(req, res) {
      // Implement create operation
    }

    /**
     * Retrieves ${entity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>} - Promise representing the operation completion.
     */
    async function get${entity}(req, res) {
      // Implement read operation
    }

    /**
     * Updates an existing ${entity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>} - Promise representing the operation completion.
     */
    async function update${entity}(req, res) {
      // Implement update operation
    }

    /**
     * Deletes an existing ${entity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>} - Promise representing the operation completion.
     */
    async function delete${entity}(req, res) {
      // Implement delete operation
    }

    // Export controller functions
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
 * This function generates routes for CRUD operations related to a specific entity.
 * @param {string} entity - The name of the entity.
 * @param {string} originalEntity - The original, uncapitalized entity name.
 * @returns {string} - The route template.
 */
function generateRouteTemplate(entity, originalEntity) {
  // Template for the route file
  return `
  /* -------------------------------------------------------------------------- */
  /*                                DEPENDENCIES                                */
  /* -------------------------------------------------------------------------- */
  // packages
    const express = require('express');
    const router = express.Router();

    // local controllers
    const ${entity}Controller = require('../controllers/${originalEntity}.controller');

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
    /**
     * Routes for ${entity} CRUD operations.
     */

    // POST - Create a new ${entity}
    router.post('/${originalEntity}', ${entity}Controller.create${entity});

    // GET - Retrieve all ${entity}s
    router.get('/${originalEntity}s', ${entity}Controller.get${entity});

    // PUT - Update a ${entity} by ID
    router.put('/${originalEntity}s/:id', ${entity}Controller.update${entity});

    // DELETE - Delete a ${entity} by ID
    router.delete('/${originalEntity}s/:id', ${entity}Controller.delete${entity});

    // Export the router
    module.exports = router;
  `;
}

module.exports = {
  generateEmptyCrud,
};
