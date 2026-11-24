import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { SiteExporterInvalidException } from '@ukef/modules/site-buyer/exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from '@ukef/modules/site-buyer/exception/site-exporter-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class SiteExporterExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof SiteExporterNotFoundException || err instanceof SiteExporterInvalidException) {
            return new BadRequestException(err.message, { cause: err });
          }

          return err;
        }),
      ),
    );
  }
}
