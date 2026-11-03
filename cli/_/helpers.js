/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
const fs = require('node:fs');
const path = require('node:path');

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */
// The generator works on the project in the current directory (run it with `npm run crud:operation`).
const SRC = path.join(process.cwd(), 'src');

/**
 * Validate an entity name: letters, digits and underscores, starting with a letter.
 * The name becomes part of file paths, so nothing else is accepted.
 * @param {string} input
 * @returns {string} The trimmed name
 */
function validateEntityName(input) {
  const entity = String(input ?? '').trim();
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(entity)) {
    throw new Error(
      'Entity name must start with a letter and contain only letters, numbers and underscores',
    );
  }
  return entity;
}

/**
 * Capitalizes the first character of the entity name.
 * @param {string} entity - The entity name
 * @returns {string} - The capitalized entity name
 */
function capitalizeEntity(entity) {
  return entity.charAt(0).toUpperCase() + entity.slice(1);
}

/**
 * Paths of the three files generated for an entity.
 * @param {string} entity
 */
function entityFiles(entity) {
  return {
    model: path.join(SRC, 'models', `${entity}.model.js`),
    controller: path.join(SRC, 'controllers', `${entity}.controller.js`),
    route: path.join(SRC, 'routes', `${entity}.route.js`),
  };
}

/**
 * Whether any file of the entity already exists.
 * @param {string} entity
 * @returns {boolean}
 */
function isEntityExists(entity) {
  return Object.values(entityFiles(entity)).some((file) => fs.existsSync(file));
}

module.exports = {
  validateEntityName,
  capitalizeEntity,
  entityFiles,
  isEntityExists,
};
