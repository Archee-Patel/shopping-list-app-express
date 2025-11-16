const authorize = (profiles) => {
  return (req, res, next) => {
    const userProfiles = req.user.profiles;
    const hasAccess = profiles.some(profile => userProfiles.includes(profile));
    
    if (!hasAccess) {
      return res.status(403).json({
        uuAppErrorMap: {
          'auth/forbidden': {
            type: 'error',
            message: `User not authorized. Required profiles: ${profiles.join(', ')}. User has: ${userProfiles.join(', ')}`
          }
        }
      });
    }
    
    next();
  };
};

module.exports = authorize;