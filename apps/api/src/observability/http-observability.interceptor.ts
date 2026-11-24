import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Injectable, Logger } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { ApiMetrics } from './api-metrics.js';
import { requestContext } from './request-context.js';

const httpMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

@Injectable()
export class HttpObservabilityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpObservabilityInterceptor.name);

  constructor(private readonly metrics: ApiMetrics) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const route = typeof request.route?.path === 'string'
      ? request.route.path : `${context.getClass().name}.${context.getHandler().name}`;
    const method = httpMethods.has(request.method) ? request.method : 'OTHER';
    const requestId = randomUUID();
    const startedAt = performance.now();
    let completed = false;

    response.setHeader('X-Request-ID', requestId);
    this.metrics.startHttp();

    const complete = (aborted: boolean) => {
      if (completed) return;
      completed = true;
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

    return new Observable((subscriber) =>
      requestContext.run(requestId, () => next.handle().subscribe(subscriber)));
  }
}
