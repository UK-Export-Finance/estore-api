import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { catchError, Observable, throwError } from 'rxjs';

import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';

@Injectable()
export class TermsFacilityExistsExceptionInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> | any {
    return next.handle().pipe(
      // map((data) => ({
      //   data,
        
      //   message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS
      // }))
      // catchError((err) => {
      //   // if (err instanceof TermsFacilityExistsException) {
      //   //   console.log("interceptor")
      //   //   return { statusCode: HttpStatus.OK, message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS };
      //   // }
      //   throwError(() => {

      //     return err;
      //   }),
      // }),
    );
  }
}
