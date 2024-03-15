const fs = require('fs').promises;

async function generateEmptyCrud(entity) {
  const modelTemplate = `
    const mongoose = require('mongoose');

    const ${entity}Schema = new mongoose.Schema({
      // Define schema fields here
    });

    module.exports = mongoose.model('${entity}', ${entity}Schema);
  `;

  const controllerTemplate = `
    const ${entity} = require('../models/${entity}.model');

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

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${entity}.controller');

    // Define routes for ${entity} CRUD operations
    router.post('/${entity}', ${entity}Controller.create${entity});
    router.get('/${entity}s', ${entity}Controller.get${entity});
    router.put('/${entity}s/:id', ${entity}Controller.update${entity});
    router.delete('/${entity}s/:id', ${entity}Controller.delete${entity});

    module.exports = router;
  `;

  await fs.mkdir(`src/models/${entity}`, { recursive: true });
  await fs.mkdir(`src/controllers/${entity}`, { recursive: true });
  await fs.mkdir(`src/routes/${entity}`, { recursive: true });

  await fs.writeFile(`src/models/${entity}/${entity}.model.js`, modelTemplate);
  await fs.writeFile(
    `src/controllers/${entity}/${entity}.controller.js`,
    controllerTemplate,
  );
  await fs.writeFile(`src/routes/${entity}/${entity}.route.js`, routeTemplate);
}

/**
 * Generate minimal CRUD operations for a given entity (model, controller, and route)
 * @description This function generates a minimal CRUD operations for a given entity (model, controller, and route)
 * @param {String} entity - The entity name
 * @returns {Promise<void>} - A promise that resolves after the files are created
 * @example generateMinimalCrud('product');
 */
async function generateMinimalCrud(entity) {
  const modelTemplate = `
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

  const controllerTemplate = `
    const ${entity} = require('../models/${entity}.model');

    // Create a new ${entity}
    async function create${entity}(req, res) {
      try {
        const new${entity} = await ${entity}.create(req.body);
        res.status(201).json(new${entity});
      } catch (error) {
        console.error('Error creating ${entity}:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get all ${entity}
    async function get${entity}s(req, res) {
      try {
        const ${entity}s = await ${entity}.find();
        res.json(${entity}s);
      } catch (error) {
        console.error('Error getting ${entity}s:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get a single ${entity} by ID
    async function get${entity}ById(req, res) {
      try {
        const ${entity} = await ${entity}.findById(req.params.id);
        if (!${entity}) {
          return res.status(404).json({ error: '${entity} not found' });
        }
        res.json(${entity});
      } catch (error) {
        console.error('Error getting ${entity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Update a ${entity} by ID
    async function update${entity}(req, res) {
      try {
        const updated${entity} = await ${entity}.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated${entity}) {
          return res.status(404).json({ error: '${entity} not found' });
        }
        res.json(updated${entity});
      } catch (error) {
        console.error('Error updating ${entity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Delete a ${entity} by ID
    async function delete${entity}(req, res) {
      try {
        const deleted${entity} = await ${entity}.findByIdAndDelete(req.params.id);
        if (!deleted${entity}) {
          return res.status(404).json({ error: '${entity} not found' });
        }
        res.json({ message: '${entity} deleted successfully' });
      } catch (error) {
        console.error('Error deleting ${entity} by ID:', error);
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

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${entity}.controller');

    // Create a new ${entity}
    router.post('/${entity}', ${entity}Controller.create${entity});

    // Get all ${entity}
    router.get('/${entity}s', ${entity}Controller.get${entity}s);

    // Get a single ${entity} by ID
    router.get('/${entity}s/:id', ${entity}Controller.get${entity}ById);

    // Update a ${entity} by ID
    router.put('/${entity}s/:id', ${entity}Controller.update${entity});

    // Delete a ${entity} by ID
    router.delete('/${entity}s/:id', ${entity}Controller.delete${entity});

    module.exports = router;
  `;

  await fs.mkdir(`src/models/${entity}`, { recursive: true });
  await fs.mkdir(`src/controllers/${entity}`, { recursive: true });
  await fs.mkdir(`src/routes/${entity}`, { recursive: true });

  await fs.writeFile(`src/models/${entity}/${entity}.model.js`, modelTemplate);
  await fs.writeFile(
    `src/controllers/${entity}/${entity}.controller.js`,
    controllerTemplate,
  );
  await fs.writeFile(`src/routes/${entity}/${entity}.route.js`, routeTemplate);
}

module.exports = {
  generateEmptyCrud,
  generateMinimalCrud,
};
