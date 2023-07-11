import { SiteBuyerException } from './site-buyer.exception';

export class SiteExporterNotFoundException extends SiteBuyerException {
  constructor(message: string, public readonly innerError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
