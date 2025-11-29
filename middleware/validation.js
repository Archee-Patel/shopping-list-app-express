
const Joi = require('joi');

const createListSchema = Joi.object({
  name: Joi.string().min(1).max(100).required()
});

const idQuerySchema = Joi.object({
  id: Joi.string().required()
});

const assignRoleSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('Authority','User').required()
});

function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const e = new Error('Validation failed: ' + error.message);
      e.status = 400;
      e.uuAppErrorMap = { 'validation/failed': { type: 'error', message: error.message } };
      return next(e);
    }
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const e = new Error('Validation failed: ' + error.message);
      e.status = 400;
      e.uuAppErrorMap = { 'validation/failed': { type: 'error', message: error.message } };
      return next(e);
    }
    next();
  };
}

module.exports = {
  validateCreateList: validateBody(createListSchema),
  validateIdQuery: validateQuery(idQuerySchema),
  validateAssignRole: validateBody(assignRoleSchema)
};
