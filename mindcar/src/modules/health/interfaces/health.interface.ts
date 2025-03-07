export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  done: boolean;
  details?: {
    database?: boolean;
    cache?: boolean;
    services?: Record<string, boolean>;
  };
}

export interface ConfigResponse {
  response: string;
}

export interface VersionResponse {
  version_hash: string;
  package_version: string;
}