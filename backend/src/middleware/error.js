exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found' });
exports.handler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') { status = 400; message = 'Résumé must be 2 MB or smaller'; }
  else if (err.code === 11000) { status = 409; message = 'You have already applied for this job'; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid ID'; }
  else if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (status === 500) { console.error(err); message = 'Something went wrong on the server'; }
  res.status(status).json({ message });
};
