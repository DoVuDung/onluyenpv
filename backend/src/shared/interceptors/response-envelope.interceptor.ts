import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvelopeResponse, CursorPaginationMeta } from '@onluyenphongvan/types';

interface PayloadWithMeta<T = unknown> {
  data: T;
  meta?: CursorPaginationMeta | null;
}

function isPayloadWithMeta(value: unknown): value is PayloadWithMeta {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    ('meta' in value || Object.keys(value).length === 1 || Object.keys(value).length === 2)
  );
}

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, EnvelopeResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<EnvelopeResponse<T>> {
    return next.handle().pipe(
      map((responseValue: unknown) => {
        // If it already matches EnvelopeResponse format, return as is
        if (
          typeof responseValue === 'object' &&
          responseValue !== null &&
          'data' in responseValue &&
          'error' in responseValue
        ) {
          return responseValue as EnvelopeResponse<T>;
        }

        if (isPayloadWithMeta(responseValue)) {
          return {
            data: responseValue.data as T,
            meta: responseValue.meta ?? null,
            error: null,
          };
        }

        return {
          data: (responseValue as T) ?? null,
          meta: null,
          error: null,
        };
      })
    );
  }
}
