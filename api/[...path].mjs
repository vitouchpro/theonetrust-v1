// SPIKE ONLY (Phase 2a): the Vercel function that hands every /api request to Fastify.
export { default } from '../apps/api/dist/serverless.mjs';
export const config = { maxDuration: 30 };
