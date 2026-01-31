import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation error handler
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('uid')
    .notEmpty()
    .withMessage('Firebase UID is required'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  handleValidationErrors
];

export const validateFirebaseLogin = [
  body('idToken').notEmpty().withMessage('Firebase ID token is required'),
  handleValidationErrors
];

// Product validations
export const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('sku').trim().notEmpty().withMessage('SKU required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be valid ISO date'),
  handleValidationErrors
];

export const validateProductUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  handleValidationErrors
];

// Transaction validations
export const validateTransaction = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description').optional().trim(),
  body('date').isISO8601().withMessage('Valid date required'),
  handleValidationErrors
];

// Query validations
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ID validation
export const validateId = [
  param('id').notEmpty().withMessage('ID parameter required'),
  handleValidationErrors
];
