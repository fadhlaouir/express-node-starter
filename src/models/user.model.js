/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */
const ROLES = ['is_user', 'is_manager', 'is_admin'];
const SALT_ROUNDS = 12;

/* -------------------------------------------------------------------------- */
/*                                 User Schema                                */
/* -------------------------------------------------------------------------- */
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    fullName: { type: String, trim: true, maxlength: 100 },
    photo: { type: String, default: '' },
    is_active: { type: Boolean, default: false },
    role: { type: String, enum: ROLES, default: 'is_user' },
    // Only hashes of the codes sent by email are stored.
    confirmationCode: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: { createdAt: 'joined_at', updatedAt: 'updated_at' } },
);

/* -------------------------------------------------------------------------- */
/*                              Password helpers                              */
/* -------------------------------------------------------------------------- */

// Hash the password whenever it is created or changed.
UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
});

/**
 * Compare a plain password with the stored hash.
 * The document must be loaded with `.select('+password')`.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Never send secrets in API responses, even when they were selected.
UserSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.confirmationCode;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  },
});

/**
 * Hash a token sent by email, so a database leak doesn't expose usable links.
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = mongoose.model('User', UserSchema);
module.exports.ROLES = ROLES;
module.exports.hashToken = hashToken;
