const { ValidationError } = require('../errors/customErrors');

// Validation middleware  
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    throw new ValidationError(
      'Validation failed', 
      error.details.map(d => d.message)
    );
  }
  next();
};

module.exports = validate;