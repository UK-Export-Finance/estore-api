import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { SiteNotFoundException } from './exception/site-not-found.exception';

@Injectable()
export class SiteExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof SiteNotFoundException) {
            return new NotFoundException('Not found', { cause: err });
          }
          return err;
        }),
      ),
    );
  }
}
