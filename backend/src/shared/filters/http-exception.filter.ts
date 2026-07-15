import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiError, EnvelopeResponse } from '@onluyenphongvan/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = `HTTP_${status}`;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const respObj = exceptionResponse as Record<string, unknown>;
        message =
          typeof respObj['message'] === 'string'
            ? respObj['message']
            : Array.isArray(respObj['message'])
              ? respObj['message'].join(', ')
              : exception.message;
        code =
          typeof respObj['error'] === 'string'
            ? respObj['error'].toUpperCase().replace(/\s+/g, '_')
            : `HTTP_${status}`;
        if (Array.isArray(respObj['details'])) {
          details = respObj['details'];
        } else if (Array.isArray(respObj['message'])) {
          details = respObj['message'];
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      // Do not leak internal stack traces to client in production
      if (process.env['NODE_ENV'] !== 'production') {
        message = exception.message;
      }
    }

    const apiError: ApiError = {
      code,
      message,
      ...(details ? { details } : {}),
    };

    const envelope: EnvelopeResponse<null> = {
      data: null,
      meta: null,
      error: apiError,
    };

    void response.status(status).send(envelope);
  }
}
