import { Global, Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { ApiMetrics } from './api-metrics.js';
import { HttpObservabilityMiddleware } from './http-observability.middleware.js';

@Global()
@Module({
  providers: [
    {
      provide: ApiMetrics,
      useFactory: () => {
        const url = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT?.trim();
        if (!url) return new ApiMetrics();

        const exporter = new OTLPMetricExporter({ url, timeoutMillis: 5_000 });
        const reader = new PeriodicExportingMetricReader({ exporter, exportIntervalMillis: 10_000, exportTimeoutMillis: 5_000 });
        return new ApiMetrics(reader);
      },
    },
  ],
  exports: [ApiMetrics],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpObservabilityMiddleware).forRoutes('{*path}');
  }
}
