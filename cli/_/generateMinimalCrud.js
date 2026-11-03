/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
const fs = require('node:fs/promises');
const { capitalizeEntity, entityFiles } = require('./helpers');
const templates = require('./templates');

/* -------------------------------------------------------------------------- */
/*                            Generate Minimal Crud                           */
/* -------------------------------------------------------------------------- */

/**
 * Write a model, a controller and a route file with working CRUD logic.
 * The route is registered automatically by src/routes/index.js.
 * @param {string} entity - Validated entity name
 * @param {{ minimal?: boolean }} [options]
 * @returns {Promise<string[]>} Paths of the files written
 */
async function generateMinimalCrud(entity, { minimal = true } = {}) {
  const Entity = capitalizeEntity(entity);
  const files = entityFiles(entity);

  await Promise.all([
    fs.writeFile(files.model, templates.model(Entity, minimal), { flag: 'wx' }),
    fs.writeFile(
      files.controller,
      templates.controller(Entity, entity, minimal),
      { flag: 'wx' },
    ),
    fs.writeFile(files.route, templates.route(Entity, entity), { flag: 'wx' }),
  ]);

  return Object.values(files);
}

module.exports = { generateMinimalCrud };
