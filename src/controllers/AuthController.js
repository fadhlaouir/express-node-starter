/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

// Models
const User = require('../models/UserModel');

// Token
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Email Template
const {
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
const FROM_EMAIL = process.env.MAILER_EMAIL_ID;
const AUTH_PASSWORD = process.env.MAILER_PASSWORD;

const CLIENT_API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_CLIENT_URL
    : process.env.DEVELOPMENT_CLIENT_URL;

var smtpTransport = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT_SSL,
  secure: false, // true for 465, false for other ports
  service: process.env.MAILER_SERVICE_PROVIDER,
  auth: {
    user: FROM_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

/* -------------------------------------------------------------------------- */
/*                               Auth Controller                              */
/* -------------------------------------------------------------------------- */
/**
 * Check if we have the email in out db or not
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const checkExistEmail = async (req, res) => {
  let foundUser = await User.findOne({ email: req.body.email });
  // if email doesn't exist
  if (!foundUser) {
    res.status(200).json({
      success: true,
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Email existe déjà',
    });
  }
};

/**
 * Sing up new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signUp = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(403).json({
      success: false,
      message: 'Veuillez saisir votre email ou votre mot de passe',
    });
  } else {
    try {
      let newUser = new User();
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.confirmationCode = crypto.randomBytes(20).toString('hex');
      newUser.fullName = req.body.fullName ?? '';
      newUser.photo =
        req.files?.photo === undefined
          ? ''
          : (req.files?.photo[0].path).replace('\\', '/');
      newUser.governorate = req.body.governorate ?? '';
      newUser.municipality = req.body.municipality ?? '';
      newUser.phoneNumber = req.body.phoneNumber ?? '';
      newUser.is_active = req.body.is_active ?? false;
      newUser.is_admin = req.body.is_admin ?? false;
      newUser.is_manager = req.body.is_manager ?? false;
      newUser.age = req.body.age ?? '';
      newUser.gender = req.body.gender ?? '';
      newUser.dateOfBirth = req.body.dateOfBirth ?? '';

      newUser.joined_at = new Date();

      await newUser.save();

      /* ------------------------------- SIGNUP MAIL ------------------------------ */
      // config email template
      const template = singUpConfirmationEmailTemplate(
        newUser.fullName,
        CLIENT_API_ENDPOINT,
        newUser.email,
        newUser.confirmationCode,
      );
      // config data for emailing
      var data = {
        from: FROM_EMAIL,
        to: newUser.email,
        subject: 'Confirmation de votre enregistrement sur l’application',
        html: template,
      };
      // send email
      smtpTransport.sendMail(data, function (err) {
        if (!err) {
          return res.json({
            message: "Veuillez vérifier votre e-mail pour plus d'instructions",
          });
        } else {
          res.status(500).json({
            success: false,
            message: err,
          });
        }
      });
      // verify email
      smtpTransport.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log('Server is ready to take our messages ', success);
        }
      });
      // response
      res.status(200).json({
        success: true,
        message:
          "L'utilisateur a été enregistré avec succès ! Merci de consulter votre email",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Sing in with an existing account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signIn = async (req, res) => {
  try {
    let foundUser = await User.findOne({ email: req.body.email }); // to check for email

    // if email doesn't exist

    if (!foundUser) {
      res.status(403).json({
        success: false,
        message: "Échec de l'authentification, utilisateur introuvable",
      });
    } else {
      // check password
      if (foundUser.comparePassword(req.body.password)) {
        // if password is correct
        if (foundUser.is_active === true) {
          let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
            expiresIn: 604800, // 1 week
          });

          res.json({
            success: true,
            token: token,
            user: foundUser,
          });
        } else {
          res.status(405).json({
            success: false,
            message:
              "Votre compte n'est pas activé ! Merci de consulter votre email ou contacter l'equipe",
          });
        }
      } else {
        res.status(403).json({
          success: false,
          message: "Échec de l'authentification, Mot de passe erroné",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send Email to reset password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const forgotPassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne({
          email: req.body.email,
        }).exec(function (err, user) {
          if (user) {
            done(err, user);
          } else {
            done('User not found.');
          }
        });
      },
      function (user, done) {
        // create the random token
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString('hex');
          done(err, user, token);
        });
      },

      function (user, token, done) {
        User.findByIdAndUpdate(
          { _id: user._id },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 3600000, // token expire in 1h
          },
          { new: true },
        ).exec(function (err, new_user) {
          done(err, token, new_user);
        });
      },
      function (token, user, done) {
        // email template
        const template = forgotPasswordEmailTemplate(
          user.fullName,
          user.email,
          CLIENT_API_ENDPOINT,
          token,
        );
        // config data for emailing
        var data = {
          from: FROM_EMAIL,
          to: user.email,
          subject: 'Reinitialisation de votre mot de passe',
          html: template,
        };
        // send email
        smtpTransport.sendMail(data, function (err) {
          if (!err) {
            return res.json({
              message:
                "Veuillez vérifier votre e-mail pour plus d'instructions",
            });
          } else {
            return done(err);
          }
        });
      },
    ],
    function (err) {
      return res.status(422).json({ message: err });
    },
  );
};

/**
 * Reset password
 */
const resetPassword = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec(function (err, user) {
    if (!err && user) {
      // Verify if we got the same password
      if (req.body.newPassword === req.body.verifyPassword) {
        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save();

        if (err) {
          return res.status(422).send({
            message: err,
          });
        } else {
          const template = resetPasswordConfirmationEmailTemplate(
            user.fullName,
          );
          var data = {
            to: user.email,
            from: FROM_EMAIL,
            subject: 'Confirmation de réinitialisation du mot de passe',
            html: template,
          };

          smtpTransport.sendMail(data, function (err) {
            if (!err) {
              return res.json({ message: 'Réinitialisation du mot de passe' });
            } else {
              return res.status(500).json({
                message: err.message,
              });
            }
          });
        }
      } else {
        return res.status(422).send({
          message: 'Passwords do not match',
        });
      }
    } else {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.',
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                               User Controller                              */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves current user object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getCurrentUser = async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id }).exec();

    if (foundUser) {
      res.status(200).json({
        success: true,
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update current user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateUserById = async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.params.id });

    const updateImages = {};

    if (req.files) {
      if (req.files.photo) {
        // delete photo
        // check if we got files object
        if (req.files?.photo !== undefined) {
          // check if the user didn't have photo
          if (foundUser.photo !== '') {
            fs.unlinkSync(`${foundUser.photo}`);
          }
        }
        //  then update
        updateImages.photo = (req.files?.photo[0].path).replace('\\', '/');
      }
    }

    let updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          ...updateImages,
          email: req.body.email ? req.body.email : foundUser.email,
          fullName: req.body.fullName ? req.body.fullName : foundUser.fullName,
          governorate: req.body.governorate
            ? req.body.governorate
            : foundUser.governorate,
          municipality: req.body.municipality
            ? req.body.municipality
            : foundUser.municipality,
          phoneNumber: req.body.phoneNumber
            ? req.body.phoneNumber
            : foundUser.phoneNumber,
          is_active: req.body.is_active
            ? req.body.is_active
            : foundUser.is_active,
          is_admin: req.body.is_admin ? req.body.is_admin : foundUser.is_admin,
          is_manager: req.body.is_manager
            ? req.body.is_manager
            : foundUser.is_manager,
          age: req.body.age ? req.body.age : foundUser.age,
          gender: req.body.gender ? req.body.gender : foundUser.gender,
          dateOfBirth: req.body.dateOfBirth
            ? req.body.dateOfBirth
            : foundUser.dateOfBirth,
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Mise à jour réussie de l'utilisateur",
      updatedUser: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllUsers = async (req, res) => {
  try {
    let foundUser = await User.find().exec();

    if (foundUser) {
      res.status(200).json({
        success: true,
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteUser = async (req, res) => {
  try {
    // Delete user image
    let imageToDelete = await User.findOne({ _id: req.params.id });
    if (imageToDelete.photo !== '') {
      fs.unlinkSync(`${imageToDelete.photo}`);
    }
    // Delete user object
    let deletedUser = await User.findOneAndDelete({ _id: req.params.id });

    if (deletedUser) {
      res.status(200).json({
        status: true,
        message: "L'utilisateur a été supprimée avec succès",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               ACCOUNT SETTING                              */
/* -------------------------------------------------------------------------- */

/**
 * Disable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const disableAccount = async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id }, { is_active: false });
    res.json({
      success: true,
      message: 'Votre compte a été désactivé',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Enable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const enableAccount = async (req, res) => {
  try {
    let foundUser = await User.findOne({ confirmationCode: req.params.token }); // to check for email
    // if confirmationCode doesn't exist
    if (!foundUser) {
      res.status(403).json({
        success: false,
        message: "Échec de l'authentification, utilisateur introuvable",
      });
    } else {
      let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
        expiresIn: 604800, // 1 week
      });
      if (foundUser.is_active === true) {
        res.json({
          success: true,
          token: token,
          user: foundUser,
          message: 'votre compte déjà activé',
        });
      } else {
        try {
          await User.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(foundUser._id) },
            { is_active: true, confirmationCode: undefined },
          );
          res.status(200).json({
            success: true,
            token: token,
            message: 'Votre compte a été activé avec succès',
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  checkExistEmail,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserById,
  disableAccount,
  enableAccount,
  getAllUsers,
  deleteUser,
};
