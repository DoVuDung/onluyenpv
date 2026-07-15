import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'custom') {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const zodError = result.error as ZodError;
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request parameters or body',
        details: zodError.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    return result.data;
  }
}
