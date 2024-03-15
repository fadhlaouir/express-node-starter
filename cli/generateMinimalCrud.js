const fs = require('fs').promises;
const path = require('path');

async function generateMinimalCrud(entity) {
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

    module.exports = mongoose.model('${ENTITY}', ${ENTITY}Schema);
  `;

  const controllerTemplate = `
    const ${ENTITY} = require('../models/${entity}.model');

    // Create a new ${entity}
    async function create${ENTITY}(req, res) {
      try {
        const new${ENTITY} = await ${ENTITY}.create(req.body);
        res.status(201).json(new${ENTITY});
      } catch (error) {
        console.error('Error creating ${entity}:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get all ${entity}
    async function get${ENTITY}s(req, res) {
      try {
        const ${entity}s = await ${ENTITY}.find();
        res.json(${entity}s);
      } catch (error) {
        console.error('Error getting ${entity}s:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Get a single ${entity} by ID
    async function get${ENTITY}ById(req, res) {
      try {
        const ${entity} = await ${ENTITY}.findById(req.params.id);
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
    async function update${ENTITY}(req, res) {
      try {
        const updated${ENTITY} = await ${ENTITY}.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated${ENTITY}) {
          return res.status(404).json({ error: '${entity} not found' });
        }
        res.json(updated${ENTITY});
      } catch (error) {
        console.error('Error updating ${entity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Delete a ${entity} by ID
    async function delete${ENTITY}(req, res) {
      try {
        const deleted${ENTITY} = await ${ENTITY}.findByIdAndDelete(req.params.id);
        if (!deleted${ENTITY}) {
          return res.status(404).json({ error: '${entity} not found' });
        }
        res.json({ message: '${entity} deleted successfully' });
      } catch (error) {
        console.error('Error deleting ${entity} by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }

    module.exports = {
      create${ENTITY},
      get${ENTITY}s,
      get${ENTITY}ById,
      update${ENTITY},
      delete${ENTITY},
    };
  `;

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${ENTITY}Controller = require('../controllers/${entity}.controller');

    // Create a new ${entity}
    router.post('/${entity}', ${ENTITY}Controller.create${ENTITY});

    // Get all ${entity}
    router.get('/${entity}s', ${ENTITY}Controller.get${ENTITY}s);

    // Get a single ${entity} by ID
    router.get('/${entity}s/:id', ${ENTITY}Controller.get${ENTITY}ById);

    // Update a ${entity} by ID
    router.put('/${entity}s/:id', ${ENTITY}Controller.update${ENTITY});

    // Delete a ${entity} by ID
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

module.exports = {
  generateMinimalCrud,
};
