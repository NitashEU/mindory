export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface HealthCheckResponse {
  done: boolean;
}

export interface ConfigResponse {
  response: string;
}

export interface VersionResponse {
  version_hash: string;
  package_version: string;
}

export interface ReachTheDevsResponse {
  response: string;
}
