import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { SiteDealFolderNotFoundException } from '../exception/site-deal-folder-not-found.exception';

@Injectable()
export class SiteDealNotFoundExceptionToBadRequestTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof SiteDealFolderNotFoundException) {
            return new BadRequestException(err.message, { cause: err });
          }
          return err;
        }),
      ),
    );
  }
}
