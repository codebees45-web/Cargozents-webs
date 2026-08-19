const logger = require('../utils/logger');

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId (e.g. a route param, or a dangling ref hit during populate)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'${err.value !== undefined ? `: '${err.value}'` : ''}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists`;
  }

  // Mongoose/MongoDB connection or server-selection failures — these show up
  // as generic "Internal Server Error" otherwise, which hides the real cause
  // (cold Atlas cluster, IP allowlist, expired credentials, DNS SRV lookup
  // failure, etc). Surface them explicitly so they're not confused with an
  // actual application bug.
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoNotConnectedError'
  ) {
    statusCode = 503;
    message = `Database unavailable: ${err.message}`;
  }

  // Mongo auth failures (bad username/password, or IP not allowlisted on Atlas)
  if (err.code === 18 || err.codeName === 'AuthenticationFailed') {
    statusCode = 503;
    message = 'Database authentication failed — check MONGO_URI credentials and Atlas network access list.';
  }

  // Always log the full stack server-side, regardless of what we send the client
  logger.error(`${req.method} ${req.originalUrl} - ${message}\n${err.stack || ''}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, name: err.name, code: err.code }),
  });
};

module.exports = errorHandler;