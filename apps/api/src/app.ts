import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import { API_V1_PREFIX, type ApiError } from '@theonetrust/contracts';
import type { Env } from './config/env.ts';
import { healthRoutes } from './routes/health.ts';

export const APP_VERSION = '0.0.0';

const CORRELATION_HEADER = 'x-correlation-id';
const SAFE_CORRELATION_ID = /^[A-Za-z0-9-]{8,64}$/;

function errorBody(code: string, message: string, correlationId: string): ApiError {
  return { error: { code, message, correlationId } };
}

/**
 * Builds the Fastify app without listening, so tests can use app.inject().
 * Every module registers under the versioned prefix.
 */
export function buildApp(env: Env): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
      // Never log secrets, payment signatures or personal data.
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["x-razorpay-signature"]',
        ],
        censor: '[REDACTED]',
      },
    },
    // Accept a well-formed caller correlation ID, otherwise generate one.
    genReqId: (req) => {
      const incoming = req.headers[CORRELATION_HEADER];
      return typeof incoming === 'string' && SAFE_CORRELATION_ID.test(incoming)
        ? incoming
        : randomUUID();
    },
    trustProxy: env.NODE_ENV === 'production',
  });

  app.addHook('onSend', async (request, reply) => {
    reply.header(CORRELATION_HEADER, request.id);
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send(errorBody('NOT_FOUND', 'Resource not found', request.id));
  });

  app.setErrorHandler((error: { statusCode?: number }, request, reply) => {
    const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    if (status >= 500) request.log.error({ err: error }, 'Unhandled error');
    // Public responses stay generic; details live only in private logs.
    reply
      .code(status)
      .send(
        errorBody(
          status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
          status >= 500 ? 'Something went wrong. Please try again.' : 'The request was invalid.',
          request.id,
        ),
      );
  });

  app.register(healthRoutes, { prefix: API_V1_PREFIX, version: APP_VERSION });

  return app;
}
