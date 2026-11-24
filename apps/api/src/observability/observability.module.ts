import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { ApiMetrics } from './api-metrics.js';
import { HttpObservabilityInterceptor } from './http-observability.interceptor.js';

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
    { provide: APP_INTERCEPTOR, useClass: HttpObservabilityInterceptor },
  ],
  exports: [ApiMetrics],
})
export class ObservabilityModule {}
