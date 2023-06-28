import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

@Injectable()
export class DtfsStorageExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof DtfsStorageFileNotFoundException) {
            return new BadRequestException('Bad request', { cause: err, description: err.message });
          }

          return err;
        }),
      ),
    );
  }
}
