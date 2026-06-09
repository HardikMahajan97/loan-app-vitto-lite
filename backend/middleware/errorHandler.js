// Centralized error handling middleware.
export const errorHandler = (err, req, res, next) => {
  console.error('[error]', {
    method: req.method,
    path: req.path,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  // PostgreSQL constraint violations
  if (err.code === '23505') {
    const detail = err.detail || '';
    if (detail.includes('uq_mobile_active')) {
      return res.status(409).json({
        success: false,
        message: 'An active application already exists for this mobile number. You can re-apply only after a rejection.',
        code: 'DUPLICATE_ACTIVE_APPLICATION',
      });
    }
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry — a record with this data already exists.',
      code: 'DUPLICATE_ENTRY',
    });
  }

  // PostgreSQL check constraint violations
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'One or more field values failed database-level validation.',
      code: 'CHECK_VIOLATION',
    });
  }

  // PostgreSQL invalid enum value
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Invalid value provided for an enumerated field.',
      code: 'INVALID_ENUM',
    });
  }

  // Default 500 - Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
    code: err.code || 'INTERNAL_ERROR',
  });
};
 // 404 handler — catches routes that don't match.
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
    code: 'NOT_FOUND',
  });
};
