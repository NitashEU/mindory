import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../exceptions/custom.exception';
import { createErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof CustomException) {
      // Our custom exceptions already have the correct format
      const exceptionResponse = exception.getResponse();
      response
        .status(exception.getStatus())
        .json(exceptionResponse);
      return;
    }

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || 'An error occurred';

      response
        .status(status)
        .json(createErrorResponse(
          message,
          status.toString(),
          typeof exceptionResponse === 'object' ? exceptionResponse : undefined
        ));
      return;
    }

    // Handle unknown errors
    console.error('Unhandled exception:', exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'development' ? { error: exception } : undefined
      ));
  }
}