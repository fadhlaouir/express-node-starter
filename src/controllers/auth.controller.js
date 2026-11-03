/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user.model');
const { hashToken } = require('../models/user.model');

// Helpers
const { env } = require('../config/env');
const { API_ENDPOINT, sendEmail } = require('../utils/helpers');
const { HttpError, readString, readPassword } = require('../utils/request');
const { STAFF_ROLES } = require('../middlewares/authorize');
const { toPublicPath, removeUpload } = require('../middlewares/multer');
const {
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */
const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour
const GENERIC_EMAIL_MESSAGE =
  'If an account exists for this email, you will receive instructions shortly';

/**
 * Sign a token with only what the API needs: never the whole user document.
 * @param {import('mongoose').Document} user
 * @returns {string}
 */
const signToken = (user) =>
  jwt.sign({ _id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });

/**
 * Public fields returned after sign-in.
 * @param {import('mongoose').Document} user
 */
const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullName,
  photo: user.photo,
  role: user.role,
});

/**
 * Create a one-time code: the plain value goes in the email, the hash in the database.
 * @returns {{ code: string, hash: string }}
 */
const createCode = () => {
  const code = crypto.randomBytes(32).toString('hex');
  return { code, hash: hashToken(code) };
};

/**
 * Send the account confirmation email.
 * @param {import('mongoose').Document} user
 * @param {string} code
 */
const sendConfirmationEmail = (user, code) =>
  sendEmail({
    to: user.email,
    subject: 'Confirm your account',
    html: singUpConfirmationEmailTemplate(
      user.fullName,
      API_ENDPOINT,
      user.email,
      code,
    ),
  });

/**
 * Check credentials and account state. Same message for an unknown email or a
 * wrong password, so the response doesn't reveal which accounts exist.
 * @param {import('express').Request} req
 */
const authenticate = async (req) => {
  const email = readString(req.body?.email, 'email', { required: true });
  const password = readString(req.body?.password, 'password', {
    required: true,
  });

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password',
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Incorrect email or password');
  }
  if (!user.is_active) {
    throw new HttpError(
      403,
      'Your account is not activated yet. Check your email for the confirmation link',
    );
  }
  return user;
};

/* -------------------------------------------------------------------------- */
/*                               Auth Controller                              */
/* -------------------------------------------------------------------------- */

/**
 * Create an account. New accounts are inactive users until the email is confirmed.
 * Role and activation are never taken from the request.
 */
const signUp = async (req, res) => {
  const photo = req.files?.photo?.[0];
  try {
    const email = readString(req.body?.email, 'email', { required: true });
    const password = readPassword(req.body?.password);
    const fullName = readString(req.body?.fullName, 'fullName');

    if (await User.exists({ email: email.toLowerCase() })) {
      throw new HttpError(409, 'A user with this email already exists');
    }

    const { code, hash } = createCode();
    const user = await User.create({
      email,
      password,
      fullName,
      photo: photo ? toPublicPath(photo) : '',
      confirmationCode: hash,
    });

    await sendConfirmationEmail(user, code);

    return res.status(201).json({
      success: true,
      message: 'Account created. Check your email to activate it',
    });
  } catch (error) {
    if (photo) await removeUpload(toPublicPath(photo));
    throw error;
  }
};

/**
 * Activate an account with the code sent by email.
 */
const confirmAccount = async (req, res) => {
  const code = readString(req.params.code, 'code', { required: true });
  const user = await User.findOneAndUpdate(
    { confirmationCode: hashToken(code) },
    { is_active: true, $unset: { confirmationCode: 1 } },
    { returnDocument: 'after' },
  );
  if (!user) {
    throw new HttpError(
      400,
      'This confirmation link is invalid or was already used',
    );
  }
  return res.json({ success: true, message: 'Your account is activated' });
};

/**
 * Send a new confirmation email to an account that isn't active yet.
 */
const resendConfirmation = async (req, res) => {
  const email = readString(req.body?.email, 'email', { required: true });
  const user = await User.findOne({
    email: email.toLowerCase(),
    is_active: false,
  });
  if (user) {
    const { code, hash } = createCode();
    user.confirmationCode = hash;
    await user.save();
    await sendConfirmationEmail(user, code);
  }
  return res.json({ success: true, message: GENERIC_EMAIL_MESSAGE });
};

/**
 * Sign in with an email and password.
 */
const signIn = async (req, res) => {
  const user = await authenticate(req);
  return res.json({
    success: true,
    token: signToken(user),
    user: publicUser(user),
  });
};

/**
 * Sign in to the back office: admins and managers only.
 */
const adminSignIn = async (req, res) => {
  const user = await authenticate(req);
  if (!STAFF_ROLES.includes(user.role)) {
    throw new HttpError(403, 'You are not allowed to sign in here');
  }
  return res.json({
    success: true,
    token: signToken(user),
    user: publicUser(user),
  });
};

/**
 * Email a password reset link. Always answers the same way, so it can't be
 * used to find out which emails have an account.
 */
const forgotPassword = async (req, res) => {
  const email = readString(req.body?.email, 'email', { required: true });
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const { code, hash } = createCode();
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: forgotPasswordEmailTemplate(
        user.fullName,
        user.email,
        API_ENDPOINT,
        code,
      ),
    });
  }

  return res.json({ success: true, message: GENERIC_EMAIL_MESSAGE });
};

/**
 * Set a new password with a valid reset token.
 */
const resetPassword = async (req, res) => {
  const token = readString(req.params.token, 'token', { required: true });
  const newPassword = readPassword(req.body?.newPassword, 'newPassword');
  if (newPassword !== req.body?.verifyPassword) {
    throw new HttpError(422, 'Passwords do not match');
  }

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'Your password was changed',
    html: resetPasswordConfirmationEmailTemplate(user.fullName),
  });

  return res.json({ success: true, message: 'Your password was reset' });
};

module.exports = {
  signUp,
  confirmAccount,
  resendConfirmation,
  signIn,
  adminSignIn,
  forgotPassword,
  resetPassword,
};
