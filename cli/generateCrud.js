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

    // Implement controller functions here
  `;

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${entity}.controller');

    // Define routes for ${entity} CRUD operations

    module.exports = router;
  `;

  await fs.mkdir(`src/models/${entity}`, { recursive: true });
  await fs.mkdir(`src/controllers/${entity}`, { recursive: true });
  await fs.mkdir(`src/routes/${entity}`, { recursive: true });

  await fs.writeFile(`src/models/${entity}.model.js`, modelTemplate);
  await fs.writeFile(
    `src/controllers/${entity}.controller.js`,
    controllerTemplate,
  );
  await fs.writeFile(`src/routes/${entity}.route.js`, routeTemplate);

  const appFile = await fs.readFile('server.js', 'utf8');
  const newRouteImport = `const ${entity}Routes = require('./src/routes/${entity}.route');`;
  const newRouteUse = `app.use('/${entity}', ${entity}Routes);`;
  const updatedAppFile = appFile
    .replace('// Add new route imports here', newRouteImport)
    .replace('// Add new route uses here', newRouteUse);
  await fs.writeFile('server.js', updatedAppFile);
}

async function generateMinimalCrud(entity) {
  const modelTemplate = `
    const mongoose = require('mongoose');

    const ${entity}Schema = new mongoose.Schema({
      // Define schema fields here
    });

    module.exports = mongoose.model('${entity}', ${entity}Schema);
  `;

  const controllerTemplate = `
    const ${entity} = require('../models/${entity}.model');

    // Implement controller functions here
  `;

  const routeTemplate = `
    const express = require('express');
    const router = express.Router();
    const ${entity}Controller = require('../controllers/${entity}.controller');

    // Define routes for ${entity} CRUD operations

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
