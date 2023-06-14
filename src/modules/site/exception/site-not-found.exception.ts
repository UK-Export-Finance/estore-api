import { SiteException } from './site.exception';

export class SiteNotFoundException extends SiteException {
  constructor(message: string, public readonly innerError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
