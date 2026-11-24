import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FolderDependencyInvalidException } from '@ukef/modules/site-deal/exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from '@ukef/modules/site-deal/exception/folder-dependency-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

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
