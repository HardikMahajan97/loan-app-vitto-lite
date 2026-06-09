import { body, param, query, validationResult } from 'express-validator';

const VALID_LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];
const VALID_STATUSES = ['pending', 'approved', 'rejected'];


// Middleware that returns a 422 if express-validator found errors.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Create Application validators.
export const validateCreateApplication = [
  body('name')
    .trim()
    .notEmpty().withMessage('Applicant name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters')
    .matches(/^[a-zA-Z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0900-\u097F\s.'-]+$/)
    .withMessage('Name contains invalid characters'),

  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[6-9][0-9]{9}$/).withMessage('Mobile must be a valid 10-digit Indian number starting with 6–9'),

  body('amount')
    .notEmpty().withMessage('Loan amount is required')
    .isFloat({ min: 1000, max: 10000000 })
    .withMessage('Loan amount must be between ₹1,000 and ₹1,00,00,000'),

  body('purpose')
    .trim()
    .notEmpty().withMessage('Loan purpose is required')
    .isLength({ min: 5, max: 200 }).withMessage('Purpose must be 5–200 characters'),

  body('language')
    .trim()
    .notEmpty().withMessage('Preferred language is required')
    .isIn(VALID_LANGUAGES).withMessage(`Language must be one of: ${VALID_LANGUAGES.join(', ')}`),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Email must be a valid email address')
    .isLength({ max: 254 }).withMessage('Email too long'),

  validate,
];

// List all applications filter validations.
export const validateListApplications = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  query('language')
    .optional()
    .isIn(VALID_LANGUAGES).withMessage(`Language must be one of: ${VALID_LANGUAGES.join(', ')}`),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('minAmount must be a positive number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxAmount must be a positive number'),

  query('from')
    .optional()
    .isISO8601().withMessage('from must be a valid ISO 8601 date'),

  query('to')
    .optional()
    .isISO8601().withMessage('to must be a valid ISO 8601 date'),

  query('sortBy')
    .optional()
    .isIn(['created_at', 'amount', 'name', 'status']).withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),

  validate,
];

// Update Status Validation
export const validateUpdateStatus = [
  param('id')
    .isUUID(4).withMessage('Application ID must be a valid UUID'),

  body('status')
    .trim()
    .notEmpty().withMessage('status is required')
    .isIn(['approved', 'rejected']).withMessage('status must be approved or rejected'),

  validate,
];
