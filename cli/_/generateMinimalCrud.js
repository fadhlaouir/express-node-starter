/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// packages
const fs = require('fs').promises;
const path = require('path');

// local helpers
const { capitalizeEntity } = require('./helpers');

/* -------------------------------------------------------------------------- */
/*                            generate Minimal Crud                           */
/* -------------------------------------------------------------------------- */
/**
 * Generates a minimal CRUD (Create, Read, Update, Delete) skeleton for the specified entity.
 * @param {string} entity - The name of the entity for which CRUD operations will be generated.
 */
async function generateMinimalCrud(entity) {
  // Ensure the first character of the entity name is uppercase
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
    // Read the content of server.js
    const serverFilePath = path.join('server.js');
    let serverFileContent = await fs.readFile(serverFilePath, 'utf-8');

    // Split the content by newlines
    let lines = serverFileContent.split('\n');

    // Insert the lineToAdd at line 48
    lines.splice(48, 0, lineToAdd);

    // Join the lines back into a string
    serverFileContent = lines.join('\n');

    // Write the modified content back to server.js
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
      // Define schema fields heres
      name: {
        type: String,
        required: true, // Name of the ${entity}
      },
      description: {
        type: String,
        required: true, // Description of the ${entity}
      },
      createdAt: {
        type: Date,
        default: Date.now, // Date and time when the ${entity} was created
      },
      updatedAt: {
        type: Date,
        default: Date.now, // Date and time when the ${entity} was last updated
      },
    });

    /**
     * Model for ${entity}.
     * This model represents the ${entity} entity in the database.
     */
    module.exports = mongoose.model('${entity}', ${entity}Schema);
  `;
}

/* -------------------------------------------------------------------------- */
/*                        generate Controller Template                        */
/* -------------------------------------------------------------------------- */
/**
 * Generates the template for the controller file.
 * This function generates basic CRUD (Create, Read, Update, Delete) operations for a given entity.
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
     * Create a new ${originalEntity}.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async function create${entity}(req, res) {
      try {
        const new${entity} = await ${entity}.create(req.body);
        res.status(201).json(new${entity});
      } catch (error) {
        console.error('Error creating ${originalEntity}:', error);
        res.status(500).json({ error: 'Failed to create ${originalEntity}' });
      }
    }

    /**
     * Get all ${originalEntity}s.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async function get${entity}s(req, res) {
      try {
        const ${originalEntity}s = await ${entity}.find();
        res.json(${originalEntity}s);
      } catch (error) {
        console.error('Error getting ${originalEntity}s:', error);
        res.status(500).json({ error: 'Failed to fetch ${originalEntity}s' });
      }
    }

    /**
     * Get a single ${originalEntity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async function get${entity}ById(req, res) {
      try {
        const ${originalEntity} = await ${entity}.findById(req.params.id);
        if (!${originalEntity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json(${originalEntity});
      } catch (error) {
        console.error('Error getting ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Failed to fetch ${originalEntity}' });
      }
    }

    /**
     * Update a ${originalEntity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async function update${entity}(req, res) {
      try {
        const updated${entity} = await ${entity}.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated${entity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json(updated${entity});
      } catch (error) {
        console.error('Error updating ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Failed to update ${originalEntity}' });
      }
    }

    /**
     * Delete a ${originalEntity} by ID.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async function delete${entity}(req, res) {
      try {
        const deleted${entity} = await ${entity}.findByIdAndDelete(req.params.id);
        if (!deleted${entity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json({ message: '${originalEntity} deleted successfully' });
      } catch (error) {
        console.error('Error deleting ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Failed to delete ${originalEntity}' });
      }
    }

    module.exports = {
      create${entity},
      get${entity}s,
      get${entity}ById,
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
     * Routes for ${originalEntity} CRUD operations.
     */

    // POST - Create a new ${originalEntity}
    router.post('/${originalEntity}', ${entity}Controller.create${entity});

    // GET - Get all ${originalEntity}s
    router.get('/${originalEntity}s', ${entity}Controller.get${entity}s);

    // GET - Get a single ${originalEntity} by ID
    router.get('/${originalEntity}s/:id', ${entity}Controller.get${entity}ById);

    // PUT - Update a ${originalEntity} by ID
    router.put('/${originalEntity}s/:id', ${entity}Controller.update${entity});

    // DELETE - Delete a ${originalEntity} by ID
    router.delete('/${originalEntity}s/:id', ${entity}Controller.delete${entity});

    // Export the router
    module.exports = router;
  `;
}

module.exports = {
  generateMinimalCrud,
};
