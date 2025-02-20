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