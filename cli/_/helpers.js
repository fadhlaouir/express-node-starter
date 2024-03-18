/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
// packages
const path = require('path');
const fs = require('fs').promises;

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Capitalizes the first character of the entity name.
 * @param {string} entity - The entity name
 * @returns {string} - The capitalized entity name
 */
function capitalizeEntity(entity) {
  return entity.charAt(0).toUpperCase() + entity.slice(1);
}

/**
 * Checks if the entity already exists in the project.
 * If the entity already exists, it logs a message and exits the process.
 * @param {string} entity - The entity name
 * @returns {boolean} - Returns true if the entity exists, false otherwise
 */
async function isEntityExists(entity) {
  // Capitalize the entity name
  const ENTITY = capitalizeEntity(entity);

  // Construct the file path for the model file
  const modelFilePath = path.join('src', 'models', `${ENTITY}.model.js`);

  try {
    // Check if the model file exists
    await fs.access(modelFilePath);
    return true; // Model file exists
  } catch (error) {
    return false; // Model file does not exist
  }
}

module.exports = {
  capitalizeEntity,
  isEntityExists,
};
