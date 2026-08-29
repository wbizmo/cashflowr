export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId: req.requestId,
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(`[${req.requestId || "no-request-id"}]`, error);
  }

  return res.status(status).json({
    success: false,
    message: isServerError ? "Internal server error" : error.message,
    requestId: req.requestId,
  });
};

export const sendError = (res, error, req, fallbackStatus = 500) => {
  const status = Number.isInteger(error?.statusCode) ? error.statusCode : fallbackStatus;
  if (status >= 500) {
    console.error(`[${req?.requestId || "no-request-id"}]`, error);
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : error.message,
    requestId: req?.requestId,
  });
};
