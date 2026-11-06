import { handleReadinessHealth } from '../../src/server/core/health';

export default {
  async fetch(request: Request): Promise<Response> {
    return handleReadinessHealth(request);
  },
};
