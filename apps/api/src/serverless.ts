/**
 * SPIKE ONLY (Phase 2a, never merged): proves on a Vercel preview that (1) a catch-all function
 * receives the original /api path, (2) the raw body reaches Fastify byte for byte, (3) the argon2
 * native binary is bundled. Uses a fixed development env: no secrets, no database.
 */
import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { hash, verify } from '@node-rs/argon2';
import { buildApp } from './app.ts';
import { loadEnv } from './config/env.ts';

const app = buildApp(loadEnv({ NODE_ENV: 'development', LOG_LEVEL: 'warn' }));
app.post('/api/v1/__spike', { config: { rawBody: true } }, async (request) => {
  const raw = request.rawBody ?? Buffer.alloc(0);
  const h = await hash('spike-check');
  return {
    path: request.url,
    rawBytes: raw.length,
    rawSha256: createHash('sha256').update(raw).digest('hex'),
    argon2: await verify(h, 'spike-check'),
    node: process.version,
  };
});
app.get('/api/v1/__spike/ip', async (request) => {
  const h = request.headers;
  const mask = (v: unknown) =>
    typeof v === 'string' ? v.replace(/\d+(?=[.:]?)/g, (d) => 'n'.repeat(d.length)) : v ?? null;
  return {
    fastifyIp: mask(request.ip),
    socket: mask(request.raw.socket.remoteAddress),
    xff: mask(h['x-forwarded-for']),
    xffCount: typeof h['x-forwarded-for'] === 'string' ? h['x-forwarded-for'].split(',').length : 0,
    xRealIp: mask(h['x-real-ip']),
    xVercelForwardedFor: mask(h['x-vercel-forwarded-for']),
    sameRealAndVercel: h['x-real-ip'] === h['x-vercel-forwarded-for'],
  };
});
const ready = app.ready();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await ready;
  app.server.emit('request', req, res);
}
