// backend/middleware/permissions.js
const requirePermission = (permission) => {
  return (req, res, next) => {
    const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    const hasFull = perms.includes("Full Access");

    if (hasFull) return next();
    if (!permission) return next();

    if (!perms.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${permission}`,
      });
    }

    next();
  };
};

module.exports = { requirePermission };
