/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const { allowRoles, allowSelfOrStaff } = require('../middlewares/authorize');
const { fileUpload } = require('../middlewares/multer');
const { authLimiter } = require('../middlewares/rate-limit');

// Controllers
const userController = require('../controllers/user.controller');

/* -------------------------------------------------------------------------- */
/*                                 User Route                                 */
/* -------------------------------------------------------------------------- */

// POST request - Check whether an email is already registered
router.post('/users/check-email', authLimiter, userController.checkExistEmail);

// GET request - List users (admins and managers)
router.get(
  '/users',
  verifyToken,
  allowRoles('is_admin', 'is_manager'),
  userController.getAllUsers,
);

// GET request - Get the signed-in user
router.get('/users/me', verifyToken, userController.getCurrentUser);

// PUT request - Change the signed-in user's password
router.put('/users/me/password', verifyToken, userController.changePassword);

// GET request - Get a user (the user themselves, admins and managers)
router.get(
  '/users/:id',
  verifyToken,
  allowSelfOrStaff,
  userController.getUserById,
);

// PUT request - Update a user (the user themselves, admins and managers)
router.put(
  '/users/:id',
  verifyToken,
  allowSelfOrStaff,
  fileUpload,
  userController.updateUserById,
);

// DELETE request - Delete a user (the user themselves, or an admin)
router.delete('/users/:id', verifyToken, userController.deleteUser);

module.exports = router;
