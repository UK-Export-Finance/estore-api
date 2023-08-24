import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { UploadFileInDealFolderExistsException } from '@ukef/modules/site-document/exception/upload-file-in-deal-folder-exists.exception';
import { UploadFileInDealFolderSiteNotFoundException } from '@ukef/modules/site-document/exception/upload-file-in-deal-folder-site-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class SiteDocumentExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof UploadFileInDealFolderExistsException || err instanceof UploadFileInDealFolderSiteNotFoundException) {
            return new BadRequestException('Bad request', { cause: err, description: err.message });
          }
          return err;
        }),
      ),
    );
  }
}
