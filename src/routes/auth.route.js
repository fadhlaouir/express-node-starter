/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();

// Middlewares
const { fileUpload } = require('../middlewares/multer');
const {
  authLimiter,
  loginAccountLimiter,
} = require('../middlewares/rate-limit');

// Controllers
const authController = require('../controllers/auth.controller');

/* -------------------------------------------------------------------------- */
/*                                 Auth Route                                 */
/* -------------------------------------------------------------------------- */

// Every public auth route is rate limited.
router.use('/auth', authLimiter);

// POST request - Create an account (inactive until the email is confirmed)
router.post('/auth/register', fileUpload, authController.signUp);

// POST request - Activate an account with the code sent by email
router.post('/auth/confirm/:code', authController.confirmAccount);

// POST request - Send a new confirmation email
router.post('/auth/resend-confirmation', authController.resendConfirmation);

// POST request - Sign in
router.post('/auth/login', loginAccountLimiter, authController.signIn);

// POST request - Sign in to the back office (admins and managers)
router.post(
  '/auth/admin/login',
  loginAccountLimiter,
  authController.adminSignIn,
);

// POST request - Email a password reset link
router.post('/auth/forget-password', authController.forgotPassword);

// POST request - Set a new password with a reset token
router.post('/auth/reset-password/:token', authController.resetPassword);

module.exports = router;
