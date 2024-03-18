/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const { fileUpload } = require('../middlewares/multer');

// controllers
const userController = require('../controllers/user.controller');

/* -------------------------------------------------------------------------- */
/*                                 User Route                                 */
/* -------------------------------------------------------------------------- */

// Get reqyest - check if email exist or not
router.post('/users/check-email', userController.checkExistEmail);

// GET request - Get all users
router.get('/users', verifyToken, userController.getAllUsers);

// GET request - Get current user
router.get('/users/me', verifyToken, userController.getCurrentUser);

// GET request - Get usser by Id
router.get('/users/:id', userController.getUserById);

// PUT request - Update user by id
router.put(
  '/users/:id',
  verifyToken,
  fileUpload,
  userController.updateUserById,
);

// DELETE request - delete user
router.delete('/users/:id', verifyToken, userController.deleteUser);

module.exports = router;
