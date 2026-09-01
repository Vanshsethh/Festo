/**
 * RBAC authorization middleware
 * @param {string[]} allowedRoles Array of roles permitted to access route
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions for this action.',
      });
    }

    next();
  };
};

/**
 * Utility to verify ownership
 * For events and other resources, user must be the creator (created_by matches)
 * @param {object} user req.user
 * @param {string} resourceCreatorId ID of the user who created the resource
 * @returns {boolean}
 */
export const hasOwnership = (user, resourceCreatorId) => {
  if (!user) return false;
  return Boolean(user.id && user.id === resourceCreatorId);
};

// Alias for backward compatibility
export const hasCollegeAccess = hasOwnership;