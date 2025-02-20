import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  ApiSuccessResponse, 
  ApiErrorResponse, 
  createSuccessResponse, 
  createErrorResponse 
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T> | ApiErrorResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T> | ApiErrorResponse> {
    return next.handle().pipe(
      // Transform successful responses
      map((data) => {
        // If the response is already formatted, return it as is
        if (data?.success !== undefined) {
          return data;
        }
        // Otherwise, wrap it in a success response
        return createSuccessResponse(data);
      }),
      // Transform errors
      catchError((error) => {
        if (error instanceof HttpException) {
          const response = error.getResponse();
          const errorMessage = typeof response === 'string' ? response : response['message'];
          return throwError(() => createErrorResponse(
            errorMessage,
            error.getStatus().toString(),
            typeof response === 'object' ? response : undefined
          ));
        }
        // For unexpected errors, return a generic error response
        console.error('Unexpected error:', error);
        const internalError = new InternalServerErrorException();
        return throwError(() => createErrorResponse(
          'Internal server error',
          internalError.getStatus().toString()
        ));
      })
    );
  }
}