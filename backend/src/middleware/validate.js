import { z } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    next(error);
  }
};

export default validate;
