/* -------------------------------------------------------------------------- */
/*                               File templates                               */
/* -------------------------------------------------------------------------- */
// Code written into src/ by the generator. It follows the project's conventions:
// errors thrown in controllers reach the error middleware, and routes that change
// data require a token.

const banner = (
  title,
) => `/* -------------------------------------------------------------------------- */
/* ${title.padStart(Math.floor((74 + title.length) / 2)).padEnd(74)} */
/* -------------------------------------------------------------------------- */`;

/**
 * Mongoose model.
 * @param {string} Entity - Capitalized name
 * @param {boolean} minimal - With example fields
 */
const model = (Entity, minimal) => `${banner('Dependencies')}
const mongoose = require('mongoose');

${banner(`${Entity} Schema`)}
const ${Entity}Schema = new mongoose.Schema(
  {
${
  minimal
    ? `    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },`
    : '    // Add fields here, for example: name: { type: String, required: true },'
}
  },
  { timestamps: true },
);

module.exports = mongoose.model('${Entity}', ${Entity}Schema);
`;

/**
 * Controller.
 * @param {string} Entity - Capitalized name
 * @param {string} entity - Name as typed
 * @param {boolean} minimal - With working CRUD logic
 */
const controller = (Entity, entity, minimal) => {
  if (!minimal) {
    return `${banner('Dependencies')}
// eslint-disable-next-line no-unused-vars
const ${Entity} = require('../models/${entity}.model');

${banner(`${Entity} Controller`)}

/**
 * Create a ${entity}.
 */
const create${Entity} = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

/**
 * List ${entity}s.
 */
const get${Entity}s = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

/**
 * Get a ${entity} by id.
 */
const get${Entity}ById = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

/**
 * Update a ${entity} by id.
 */
const update${Entity} = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

/**
 * Delete a ${entity} by id.
 */
const delete${Entity} = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

module.exports = {
  create${Entity},
  get${Entity}s,
  get${Entity}ById,
  update${Entity},
  delete${Entity},
};
`;
  }

  return `${banner('Dependencies')}
const ${Entity} = require('../models/${entity}.model');
const { HttpError, readString } = require('../utils/request');

${banner(`${Entity} Controller`)}

// Only these fields are read from the request body.
const pickFields = (body = {}) => ({
  name: readString(body.name, 'name'),
  description: readString(body.description, 'description'),
});

/**
 * Create a ${entity}.
 */
const create${Entity} = async (req, res) => {
  const ${entity} = await ${Entity}.create(pickFields(req.body));
  res.status(201).json({ success: true, ${entity} });
};

/**
 * List ${entity}s, newest first: ?page=1&limit=20.
 */
const get${Entity}s = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
  );
  const [items, total] = await Promise.all([
    ${Entity}.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ${Entity}.countDocuments(),
  ]);
  res.json({
    success: true,
    ${entity}s: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

/**
 * Get a ${entity} by id.
 */
const get${Entity}ById = async (req, res) => {
  const ${entity} = await ${Entity}.findById(req.params.id);
  if (!${entity}) throw new HttpError(404, '${Entity} not found');
  res.json({ success: true, ${entity} });
};

/**
 * Update a ${entity} by id.
 */
const update${Entity} = async (req, res) => {
  const fields = Object.fromEntries(
    Object.entries(pickFields(req.body)).filter(([, value]) => value !== undefined),
  );
  const ${entity} = await ${Entity}.findByIdAndUpdate(req.params.id, fields, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!${entity}) throw new HttpError(404, '${Entity} not found');
  res.json({ success: true, ${entity} });
};

/**
 * Delete a ${entity} by id.
 */
const delete${Entity} = async (req, res) => {
  const ${entity} = await ${Entity}.findByIdAndDelete(req.params.id);
  if (!${entity}) throw new HttpError(404, '${Entity} not found');
  res.json({ success: true, message: '${Entity} deleted' });
};

module.exports = {
  create${Entity},
  get${Entity}s,
  get${Entity}ById,
  update${Entity},
  delete${Entity},
};
`;
};

/**
 * Router. Reading is public; creating, updating and deleting require a token.
 * @param {string} Entity - Capitalized name
 * @param {string} entity - Name as typed
 */
const route = (Entity, entity) => `${banner('Dependencies')}
const router = require('express').Router();
const verifyToken = require('../middlewares/verify-token');
const ${entity}Controller = require('../controllers/${entity}.controller');

${banner(`${Entity} Route`)}

// POST request - Create a ${entity}
router.post('/${entity}s', verifyToken, ${entity}Controller.create${Entity});

// GET request - List ${entity}s
router.get('/${entity}s', ${entity}Controller.get${Entity}s);

// GET request - Get a ${entity} by id
router.get('/${entity}s/:id', ${entity}Controller.get${Entity}ById);

// PUT request - Update a ${entity} by id
router.put('/${entity}s/:id', verifyToken, ${entity}Controller.update${Entity});

// DELETE request - Delete a ${entity} by id
router.delete('/${entity}s/:id', verifyToken, ${entity}Controller.delete${Entity});

module.exports = router;
`;

module.exports = { model, controller, route };
