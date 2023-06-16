import { DtfsException } from './dtfs.exception';

export class DtfsFileNotFoundException extends DtfsException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
