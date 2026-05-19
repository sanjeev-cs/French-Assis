export const notFoundHandler = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const response = {
    message: err.message || 'Unexpected server error'
  };

  if (process.env.NODE_ENV !== 'production' && err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};
