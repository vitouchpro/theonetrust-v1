import type { FastifyPluginAsync } from 'fastify';
import type { HealthResponse } from '@theonetrust/contracts';

export interface HealthRouteOptions {
  version: string;
}

export const healthRoutes: FastifyPluginAsync<HealthRouteOptions> = async (app, opts) => {
  app.get('/health', async (): Promise<HealthResponse> => ({
    status: 'ok',
    service: 'theonetrust-api',
    version: opts.version,
    time: new Date().toISOString(),
  }));
};
