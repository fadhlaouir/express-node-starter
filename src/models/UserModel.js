/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

/* -------------------------------------------------------------------------- */
/*                                 User Schema                                */
/* -------------------------------------------------------------------------- */
const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: String,
  photo: String,
  is_active: Boolean,
  role: { type: String, require: true }, // is_manager, is_admin, is_user
  confirmationCode: String,
  resetPasswordToken: String,
  resetPasswordExpires: String,
  joined_at: Date,
  updated_at: Date,
});

/* -------------------------------------------------------------------------- */
/*                              PASSWORD HELPERS                              */
/* -------------------------------------------------------------------------- */
/**
 * Encrypt password before saving users objects int database we need to run
 * this encrypt than save it. (pre save)
 */
UserSchema.pre('save', function (next) {
  let user = this;
  if (this.isModified('password' || this.isNew)) {
    // generate 10 length random characters
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      // mix the 10 length random characters with user password => output the hash
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        // we are done with the operation so let's move on
        next();
      });
    });
  } else {
    return next();
  }
});

/**
 * this function to compare password
 * @param {String} password
 * @returns {boolean}
 */
UserSchema.methods.comparePassword = function (password) {
  let user = this; // this reference the user itself
  return bcrypt.compareSync(password, user.password);
};

// export User Schema
module.exports = mongoose.model('User', UserSchema);
