const validateCreateList = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
    return res.status(400).json({
      uuAppErrorMap: {
        'validation/name-invalid': {
          type: 'error',
          message: 'Name is required and must be between 1-100 characters'
        }
      }
    });
  }
  
  next();
};

const validateId = (req, res, next) => {
  const id = req.body.id || req.query.id;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      uuAppErrorMap: {
        'validation/id-required': {
          type: 'error',
          message: 'ID is required'
        }
      }
    });
  }
  
  next();
};

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        uuAppErrorMap: {
          'validation/fields-required': {
            type: 'error',
            message: `Required fields missing: ${missingFields.join(', ')}`
          }
        }
      });
    }
    
    next();
  };
};

module.exports = {
  validateCreateList,
  validateId,
  validateRequiredFields
};