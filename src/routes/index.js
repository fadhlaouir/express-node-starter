/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const fs = require('node:fs');
const path = require('node:path');
const router = require('express').Router();

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

// Registers every `*.route.js` file in this folder, so a new route file (for
// example one made by `npm run crud:operation`) works without editing anything.
for (const file of fs.readdirSync(__dirname).sort()) {
  if (file.endsWith('.route.js')) {
    router.use(require(path.join(__dirname, file)));
  }
}

module.exports = router;
