import * as client from 'prom-client';

export const grpcRequestsTotal = new client.Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests',
});

export const grpcRequestDuration = new client.Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'Duration of gRPC requests in seconds',
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const grpcResponseLatency = new client.Histogram({
  name: 'grpc_response_latency_seconds',
  help: 'Histogram of gRPC response latencies',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5] // Example buckets in seconds
});

client.register.registerMetric(grpcRequestsTotal);
client.register.registerMetric(grpcRequestDuration);
client.register.registerMetric(grpcResponseLatency);