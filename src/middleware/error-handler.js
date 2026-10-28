import { AppError } from '../utils/app-error.js';
import { logger } from '../config/logger.js';

const body = (code, message, requestId) => ({
  success: false,
  error: { code, message, requestId },
});

export function notFound(req, res) {
  res.status(404).json(body('NOT_FOUND', 'Route not found', req.id));
}

// Express recognizes error handlers by their 4 parameters, so keep `next`
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(body(err.code, err.message, req.id));
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json(body('INVALID_JSON', 'Malformed JSON body', req.id));
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json(body('PAYLOAD_TOO_LARGE', 'Request body too large', req.id));
  }
  logger.error({ err, requestId: req.id }, 'Unhandled error'); // details stay in server logs
  res.status(500).json(body('INTERNAL_ERROR', 'Something went wrong', req.id));
}