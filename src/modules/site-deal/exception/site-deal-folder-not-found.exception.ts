import { SiteDealException } from './site-deal.exception';

export class SiteDealFolderNotFoundException extends SiteDealException {
  constructor(message: string, public readonly innerError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
