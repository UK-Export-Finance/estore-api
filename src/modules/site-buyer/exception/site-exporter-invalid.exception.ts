import { SiteBuyerException } from './site-buyer.exception';

export class SiteExporterInvalidException extends SiteBuyerException {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
