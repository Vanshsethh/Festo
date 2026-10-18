import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../types/index.js';

/**
 * RBAC authorization middleware
 * @param allowedRoles Array of roles permitted to access route
 */
export const authorize = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions for this action.',
      });
      return;
    }

    next();
  };
};

/**
 * Utility to verify ownership
 * For events and other resources, user must be the creator (created_by matches)
 */
export const hasOwnership = (
  user: AuthUser | null | undefined,
  resourceCreatorId: string | null | undefined
): boolean => {
  if (!user) return false;
  return Boolean(user.id && user.id === resourceCreatorId);
};

// Alias for backward compatibility
export const hasCollegeAccess = hasOwnership;
