import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for custom exceptions
 * Maps to Rust's error handling pattern
 */
export class CustomException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(
      {
        success: false,
        error: {
          message,
          code,
          details,
        },
      },
      status
    );
  }
}

/**
 * Not Found Exception
 */
export class NotFoundException extends CustomException {
  constructor(message: string = 'Resource not found', details?: Record<string, any>) {
    super(message, HttpStatus.NOT_FOUND, 'NOT_FOUND', details);
  }
}

/**
 * Bad Request Exception
 */
export class BadRequestException extends CustomException {
  constructor(message: string = 'Bad request', details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', details);
  }
}

/**
 * Unauthorized Exception
 */
export class UnauthorizedException extends CustomException {
  constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', details);
  }
}

/**
 * Rate Limit Exception
 */
export class RateLimitException extends CustomException {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, any>) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * LLM Client Error Exception
 */
export class LLMClientException extends CustomException {
  constructor(message: string = 'LLM client error', details?: Record<string, any>) {
    super(message, HttpStatus.BAD_GATEWAY, 'LLM_CLIENT_ERROR', details);
  }
}

/**
 * Tool Error Exception
 */
export class ToolException extends CustomException {
  constructor(message: string = 'Tool execution error', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'TOOL_ERROR', details);
  }
}

/**
 * Symbol Error Exception
 */
export class SymbolException extends CustomException {
  constructor(message: string = 'Symbol operation error', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'SYMBOL_ERROR', details);
  }
}