/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const crypto = require('crypto');

// Models
const User = require('../models/user.model');

// Token
const jwt = require('jsonwebtoken');

// Email Template
const {
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');

// Helpers
const { sendEmail, FROM_EMAIL, API_ENDPOINT } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Sign up a new user
 * @param {Object} req - Request object containing user data
 * @param {Object} res - Response object to send JSON response
 */
const signUp = async (req, res) => {
  try {
    const { email, password, fullName, role, is_active } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez saisir votre email ou votre mot de passe',
      });
    }

    // Check if user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet e-mail existe déjà',
      });
    }

    // Create a new user instance
    const newUser = new User({
      email,
      password,
      confirmationCode: crypto.randomBytes(20).toString('hex'),
      fullName,
      photo: req.files?.photo ? req.files.photo[0].path.replace('\\', '/') : '',
      is_active: is_active ?? false,
      role,
      joined_at: new Date(),
    });

    // Save the new user
    await newUser.save();

    // Send confirmation email
    const template = singUpConfirmationEmailTemplate(
      newUser.fullName,
      API_ENDPOINT,
      newUser.email,
      newUser.confirmationCode,
    );

    const data = {
      from: FROM_EMAIL,
      to: newUser.email,
      subject: 'Confirmation de votre enregistrement sur l’application',
      html: template,
    };

    await sendEmail(data);

    return res.json({
      message: "Veuillez vérifier votre e-mail pour plus d'instructions",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de l'enregistrement de l'utilisateur",
      error: error.message,
    });
  }
};

/**
 * Sign in with an existing account
 * @param {Object} req - Request object containing user credentials
 * @param {Object} res - Response object to send JSON response
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const foundUser = await User.findOne({ email });

    // If user not found or password doesn't match, return error
    if (!foundUser || !foundUser.comparePassword(password)) {
      return res.status(403).json({
        success: false,
        message: "Échec de l'authentification, email ou mot de passe incorrect",
      });
    }

    // Check if user account is active
    if (!foundUser.is_active) {
      return res.status(405).json({
        success: false,
        message:
          "Votre compte n'est pas activé ! Merci de consulter votre email ou contacter l'équipe",
      });
    }

    // Generate JWT token
    const token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });

    // Return success response with token and user information
    return res.json({
      success: true,
      token,
      user: {
        _id: foundUser._id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        role: foundUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'authentification",
      error: error.message,
    });
  }
};

/**
 * Sign in with an existing account as in admin
 * @param {Object} req - Request object containing user credentials
 * @param {Object} res - Response object to send JSON response
 */
const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const foundUser = await User.findOne({ email });

    // If user not found or password doesn't match, return error
    if (!foundUser || !(await foundUser.comparePassword(password))) {
      return res.status(403).json({
        success: false,
        message:
          "Échec de l'authentification, utilisateur introuvable ou mot de passe erroné",
      });
    }

    // Check if user account is active
    if (!foundUser.is_active) {
      return res.status(405).json({
        success: false,
        message:
          "Votre compte n'est pas activé ! Merci de consulter votre email ou contacter l'équipe",
      });
    }

    // Check user role
    const allowedRoles = ['is_admin', 'is_manager'];
    if (!allowedRoles.includes(foundUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à vous connecter",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { ...foundUser.toJSON(), isAdmin: true },
      process.env.SECRET,
      {
        expiresIn: 604800,
      },
    );

    return res.json({
      success: true,
      token,
      // return user information without password field
      user: {
        _id: foundUser._id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        role: foundUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'authentification",
      error: error.message,
    });
  }
};

/**
 * Send email for resetting password
 * @param {Object} req - Request object containing user email
 * @param {Object} res - Response object to send JSON response
 */
const forgotPassword = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Generate random token
    const token = crypto.randomBytes(20).toString('hex');

    // Update user with reset token and expiration time
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send reset password email
    const template = forgotPasswordEmailTemplate(
      user.fullName,
      user.email,
      API_ENDPOINT,
      token,
    );

    const data = {
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: template,
    };

    await sendEmail(data);

    return res.json({
      message: "Veuillez vérifier votre e-mail pour plus d'instructions",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Une erreur est survenue.', error: error.message });
  }
};

/**
 * Reset user password
 * @param {Object} req - Request object containing token and new password
 * @param {Object} res - Response object to send JSON response
 */
const resetPassword = async (req, res) => {
  try {
    // Find user by reset password token and check expiration
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // If user not found or token expired, return error
    if (!user) {
      return res.status(400).json({
        message:
          'Le jeton de réinitialisation de mot de passe est invalide ou a expiré.',
      });
    }

    // Check if new password matches verification password
    if (req.body.newPassword !== req.body.verifyPassword) {
      return res
        .status(422)
        .json({ message: 'Le mot de passe ne correspondent pas.' });
    }

    // Update user's password and clear reset token fields
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password reset confirmation email
    const template = resetPasswordConfirmationEmailTemplate(user.fullName);
    const data = {
      to: user.email,
      from: FROM_EMAIL,
      subject: 'Confirmation de réinitialisation du mot de passe',
      html: template,
    };

    await sendEmail(data);

    return res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Une erreur est survenue.', error: error.message });
  }
};

module.exports = {
  signUp,
  signIn,
  adminSignIn,
  forgotPassword,
  resetPassword,
};
