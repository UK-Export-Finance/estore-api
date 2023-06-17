import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GraphException } from './graph.exception';
import { GraphInvalidRequestException } from './graph-invalid-request.exception';

describe('GraphInvalidRequestException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GraphInvalidRequestException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GraphInvalidRequestException(message);

    expect(exception.name).toBe('GraphInvalidRequestException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new GraphInvalidRequestException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of GraphException', () => {
    expect(new GraphInvalidRequestException(message)).toBeInstanceOf(GraphException);
  });
});
