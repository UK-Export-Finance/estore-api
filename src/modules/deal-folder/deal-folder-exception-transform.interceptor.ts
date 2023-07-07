import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { UploadFileInDealFolderExistsException } from './exception/upload-file-in-deal-folder-exists.exception';

@Injectable()
export class DealFolderExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof UploadFileInDealFolderExistsException) {
            return new BadRequestException('Bad request', { cause: err, description: err.message });
          }
          return err;
        }),
      ),
    );
  }
}
