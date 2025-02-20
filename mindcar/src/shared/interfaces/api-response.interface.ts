/**
 * Base interface for all API responses
 * Migrated from Rust's ApiResponse trait
 */
export interface ApiResponse {
  // Common response fields that all API responses should have
  success?: boolean;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
}

/**
 * Generic API response wrapper
 * @template T The type of data in the response
 */
export interface ApiResponseWrapper<T> extends ApiResponse {
  data?: T;
}

/**
 * Error response format
 */
export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
}

/**
 * Success response format
 * @template T The type of data in the response
 */
export interface ApiSuccessResponse<T> extends ApiResponse {
  success: true;
  data: T;
}

/**
 * Type guard to check if a response is an error response
 */
export function isApiErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return !response.success && !!response.error;
}

/**
 * Type guard to check if a response is a success response
 */
export function isApiSuccessResponse<T>(response: ApiResponse): response is ApiSuccessResponse<T> {
  return !!response.success && !response.error;
}

/**
 * Helper function to create a success response
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}