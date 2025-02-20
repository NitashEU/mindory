/**
 * Base interface for all API responses
 */
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Health check response interface
 */
export interface HealthCheckResponse extends ApiResponse {
  data: {
    done: boolean;
  };
}

/**
 * Configuration response interface
 */
export interface ConfigResponse extends ApiResponse {
  data: {
    response: string;
  };
}

/**
 * Version information response interface
 */
export interface VersionResponse extends ApiResponse {
  data: {
    version_hash: string;
    package_version: string;
  };
}

/**
 * Error response interface
 */
export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}