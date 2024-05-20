import { GraphException } from './graph.exception';

export class GraphAuthenticationFailedException extends GraphException {
  constructor(
    message: string,
    public readonly innerError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
