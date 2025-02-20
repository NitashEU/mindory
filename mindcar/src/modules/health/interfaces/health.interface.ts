export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  details?: {
    database?: boolean;
    cache?: boolean;
    services?: Record<string, boolean>;
  };
}