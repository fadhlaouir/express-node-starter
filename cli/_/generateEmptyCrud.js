/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
const { generateMinimalCrud } = require('./generateMinimalCrud');

/* -------------------------------------------------------------------------- */
/*                             Generate Empty Crud                            */
/* -------------------------------------------------------------------------- */

/**
 * Write a model, a controller and a route file with empty handlers to fill in.
 * @param {string} entity - Validated entity name
 * @returns {Promise<string[]>} Paths of the files written
 */
function generateEmptyCrud(entity) {
  return generateMinimalCrud(entity, { minimal: false });
}

module.exports = { generateEmptyCrud };
