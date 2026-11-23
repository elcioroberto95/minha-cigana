import { createServer } from 'node:http';

export function createApiServer() {
  return createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    const path = request.url?.split('?', 1)[0];

    if (path !== '/health') {
      response.statusCode = 404;
      response.end(JSON.stringify({ error: 'not_found' }));
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET, HEAD');
      response.end(JSON.stringify({ error: 'method_not_allowed' }));
      return;
    }

    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify({ status: 'ok' }));
  });
}
