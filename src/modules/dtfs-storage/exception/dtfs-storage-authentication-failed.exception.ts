import { DtfsStorageException } from './dtfs-storage.exception';

export class DtfsStorageAuthenticationFailedException extends DtfsStorageException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
