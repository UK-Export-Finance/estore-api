import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { FolderDependencyInvalidException } from '../exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from '../exception/folder-dependency-not-found.exception';

@Injectable()
export class FolderDependencyExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof FolderDependencyNotFoundException || err instanceof FolderDependencyInvalidException) {
            return new BadRequestException(err.message, { cause: err });
          }
          return err;
        }),
      ),
    );
  }
}
