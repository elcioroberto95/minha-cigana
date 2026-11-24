import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Injectable, Logger } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ApiMetrics } from './api-metrics.js';
import { requestContext } from './request-context.js';

const httpMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

@Injectable()
export class HttpObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpObservabilityMiddleware.name);

  constructor(private readonly metrics: ApiMetrics) {}

  use(request: Request, response: Response, next: NextFunction) {
    const method = httpMethods.has(request.method) ? request.method : 'OTHER';
    const requestId = randomUUID();
    const startedAt = performance.now();
    let completed = false;

    response.setHeader('X-Request-ID', requestId);
    this.metrics.startHttp();

    const complete = (aborted: boolean) => {
      if (completed) return;
      completed = true;
      const route = typeof request.route?.path === 'string' ? request.route.path : 'unmatched';
      const elapsed = performance.now() - startedAt;
      const status = aborted ? 499 : response.statusCode;
      this.metrics.finishHttp(method, route, status, elapsed);
      this.logger.log({
        event: 'http.request.completed',
        request_id: requestId,
        method,
        route,
        status,
        duration_ms: Math.round(elapsed),
        aborted,
      });
    };

    response.once('finish', () => complete(false));
    response.once('close', () => complete(!response.writableFinished));

    requestContext.run(requestId, next);
  }
}
