/**
 * Express middleware to validate request body, query, or params using Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    // Assign parsed & sanitized data back to the request
    req[source] = result.data;
    next();
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
