/* -------------------------------------------------------------------------- */
/*                                  Authorize                                 */
/* -------------------------------------------------------------------------- */

const STAFF_ROLES = ['is_admin', 'is_manager'];

/**
 * Allow only the given roles. Use after `verifyToken`.
 * @param {...string} roles - For example 'is_admin', 'is_manager'
 */
const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.decoded?.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not allowed to do this' });
    }
    return next();
  };

/**
 * Whether the signed-in user is an admin or a manager.
 * @param {import('express').Request} req
 * @returns {boolean}
 */
const isStaff = (req) => STAFF_ROLES.includes(req.decoded?.role);

/**
 * Allow the user named in `:id`, or staff. Use after `verifyToken`.
 */
const allowSelfOrStaff = (req, res, next) => {
  if (req.decoded?._id === req.params.id || isStaff(req)) return next();
  return res
    .status(403)
    .json({ success: false, message: 'You are not allowed to do this' });
};

module.exports = { STAFF_ROLES, allowRoles, allowSelfOrStaff, isStaff };
