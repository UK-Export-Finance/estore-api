import { GraphException } from "@ukef/modules/graph/exception/graph.exception";

export class TermsFacilityExistsException extends GraphException {
  constructor(message: string, public readonly innerError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
