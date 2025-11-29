
module.exports = (allowedProfiles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.profiles) {
      const e = new Error('Unauthorized');
      e.status = 401;
      e.uuAppErrorMap = { 'auth/unauthorized': { type: 'error', message: 'Unauthorized' } };
      return next(e);
    }
    
    // Allow if user has ANY of the allowed profiles
    const hasAccess = allowedProfiles.some(profile => req.user.profiles.includes(profile));
    
    if (!hasAccess && allowedProfiles.length > 0) {
      const e = new Error(`Access denied. Required profiles: ${allowedProfiles.join(', ')}`);
      e.status = 403;
      e.uuAppErrorMap = { 'auth/forbidden': { type: 'error', message: e.message } };
      return next(e);
    }
    next();
  };
};