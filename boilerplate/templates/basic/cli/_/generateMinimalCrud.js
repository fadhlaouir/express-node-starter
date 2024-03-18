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
 * @param {string} entity - The name of the entity.
 * @returns {string} - The model template.
 */
function generateModelTemplate(entity) {
  return `
    const mongoose = require('mongoose');

    const ${entity}Schema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
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

    // Create a new ${originalEntity}
    async function create${entity}(req, res) {
      try {
        const new${entity} = await ${entity}.create(req.body);
        res.status(201).json(new${entity});
      } catch (error) {
        console.error('Error creating ${originalEntity}:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get all ${originalEntity}
    async function get${entity}s(req, res) {
      try {
        const ${originalEntity}s = await ${entity}.find();
        res.json(${originalEntity}s);
      } catch (error) {
        console.error('Error getting ${originalEntity}s:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get a single ${originalEntity} by ID
    async function get${entity}ById(req, res) {
      try {
        const ${originalEntity} = await ${entity}.findById(req.params.id);
        if (!${originalEntity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json(${originalEntity});
      } catch (error) {
        console.error('Error getting ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Update a ${originalEntity} by ID
    async function update${entity}(req, res) {
      try {
        const updated${entity} = await ${entity}.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated${entity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json(updated${entity});
      } catch (error) {
        console.error('Error updating ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Delete a ${originalEntity} by ID
    async function delete${entity}(req, res) {
      try {
        const deleted${entity} = await ${entity}.findByIdAndDelete(req.params.id);
        if (!deleted${entity}) {
          return res.status(404).json({ error: '${originalEntity} not found' });
        }
        res.json({ message: '${originalEntity} deleted successfully' });
      } catch (error) {
        console.error('Error deleting ${originalEntity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
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
 * @param {string} entity - The name of the entity.
 * @param {string} originalEntity - The original, uncapitalized entity name.
 * @returns {string} - The route template.
 */
function generateRouteTemplate(entity, originalEntity) {
  return `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${originalEntity}.controller');

    // Create a new ${originalEntity}
    router.post('/${originalEntity}', ${entity}Controller.create${entity});

    // Get all ${originalEntity}
    router.get('/${originalEntity}s', ${entity}Controller.get${entity}s);

    // Get a single ${originalEntity} by ID
    router.get('/${originalEntity}s/:id', ${entity}Controller.get${entity}ById);

    // Update a ${originalEntity} by ID
    router.put('/${originalEntity}s/:id', ${entity}Controller.update${entity});

    // Delete a ${originalEntity} by ID
    router.delete('/${originalEntity}s/:id', ${entity}Controller.delete${entity});

    module.exports = router;
  `;
}

module.exports = {
  generateMinimalCrud,
};
