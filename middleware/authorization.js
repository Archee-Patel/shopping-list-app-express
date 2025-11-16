const authorize = (allowedProfiles) => {
  return (req, res, next) => {
    const userProfiles = req.user.profiles;
    const hasAccess = allowedProfiles.some(profile => userProfiles.includes(profile));
    
    if (!hasAccess) {
      return res.status(403).json({
        uuAppErrorMap: {
          'auth/forbidden': {
            type: 'error',
            message: `Access denied. Required: ${allowedProfiles.join(', ')}`
          }
        }
      });
    }
    
    next();
  };
};

module.exports = authorize;