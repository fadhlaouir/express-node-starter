/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
const fs = require('node:fs/promises');
const { entityFiles } = require('./helpers');

/* -------------------------------------------------------------------------- */
/*                                 Delete Crud                                */
/* -------------------------------------------------------------------------- */

/**
 * Remove the model, controller and route files of an entity.
 * @param {string} entity - Validated entity name
 * @returns {Promise<string[]>} Paths of the files removed
 */
async function deleteCrud(entity) {
  const files = Object.values(entityFiles(entity));
  await Promise.all(files.map((file) => fs.rm(file, { force: true })));
  return files;
}

module.exports = { deleteCrud };
