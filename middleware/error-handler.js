
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const uuAppErrorMap = err.uuAppErrorMap || { 'server/error': { type: 'error', message } };
  
  // Only log server errors (5xx), not client errors (4xx)
  if (status >= 500) {
    console.error(err);
  }
  
  res.status(status).json({ uuAppErrorMap });
};
