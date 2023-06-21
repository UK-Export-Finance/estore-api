import { DtfsStorageException } from './dtfs-storage.exception';

export class DtfsStorageFileNotFoundException extends DtfsStorageException {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
