/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const User = require('../models/user.model');
const { ROLES } = require('../models/user.model');
const { toPublicPath, removeUpload } = require('../middlewares/multer');
const { HttpError, readString, readPassword } = require('../utils/request');

/* -------------------------------------------------------------------------- */
/*                               User Controller                              */
/* -------------------------------------------------------------------------- */

/**
 * Check whether an email is already registered (for sign-up forms).
 */
const checkExistEmail = async (req, res) => {
  const email = readString(req.body?.email, 'email', { required: true });
  const exists = Boolean(await User.exists({ email: email.toLowerCase() }));
  res.json({ success: true, exists });
};

/**
 * Get the signed-in user.
 */
const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.decoded._id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ success: true, user });
};

/**
 * Get a user by id: the user themselves, or staff.
 */
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ success: true, user });
};

/**
 * List users, newest first, with pagination: ?page=1&limit=20 (staff only).
 */
const getAllUsers = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
  );

  const [users, total] = await Promise.all([
    User.find()
      .sort({ joined_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

/**
 * Update a user: the user themselves, or staff. Users can change their name and
 * photo; only admins can change a role or activation. Passwords change through
 * PUT /users/me/password.
 */
const updateUserById = async (req, res) => {
  const photo = req.files?.photo?.[0];
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');

    const fullName = readString(req.body?.fullName, 'fullName');
    if (fullName !== undefined) user.fullName = fullName;

    if (req.decoded.role === 'is_admin') {
      const role = readString(req.body?.role, 'role');
      if (role !== undefined) {
        if (!ROLES.includes(role)) throw new HttpError(422, 'Unknown role');
        user.role = role;
      }
      if (typeof req.body?.is_active === 'boolean') {
        user.is_active = req.body.is_active;
      }
    }

    const previousPhoto = user.photo;
    if (photo) user.photo = toPublicPath(photo);

    await user.save();
    if (photo) await removeUpload(previousPhoto);

    res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    if (photo) await removeUpload(toPublicPath(photo));
    throw error;
  }
};

/**
 * Change the signed-in user's password. Requires the current password.
 */
const changePassword = async (req, res) => {
  const currentPassword = readString(
    req.body?.currentPassword,
    'currentPassword',
    { required: true },
  );
  const newPassword = readPassword(req.body?.newPassword, 'newPassword');

  const user = await User.findById(req.decoded._id).select('+password');
  if (!user) throw new HttpError(404, 'User not found');
  if (!(await user.comparePassword(currentPassword))) {
    throw new HttpError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
};

/**
 * Delete a user: the user themselves, or an admin.
 */
const deleteUser = async (req, res) => {
  if (req.decoded._id !== req.params.id && req.decoded.role !== 'is_admin') {
    throw new HttpError(403, 'You are not allowed to do this');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  await removeUpload(user.photo);
  res.json({ success: true, message: 'User deleted' });
};

module.exports = {
  checkExistEmail,
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUserById,
  changePassword,
  deleteUser,
};
