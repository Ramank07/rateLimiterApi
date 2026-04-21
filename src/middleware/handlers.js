const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Request body must be valid JSON.',
    });
  }

  return res.status(500).json({
    error: 'Internal server error.',
  });
};

export { notFoundHandler, errorHandler };
