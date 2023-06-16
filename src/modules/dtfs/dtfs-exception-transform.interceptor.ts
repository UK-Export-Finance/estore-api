import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { DtfsFileNotFoundException } from './exception/dtfs-file-not-found.exception';

@Injectable()
export class DtfsExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof DtfsFileNotFoundException) {
            return new BadRequestException('Bad request', { cause: err, description: err.message });
          }

          return err;
        }),
      ),
    );
  }
}
