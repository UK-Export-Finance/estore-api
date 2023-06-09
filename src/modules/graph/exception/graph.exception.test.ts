import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GraphException } from './graph.exception';

describe('GraphException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GraphException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GraphException(message);

    expect(exception.name).toBe('GraphException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new GraphException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of Error', () => {
    expect(new GraphException(message)).toBeInstanceOf(Error);
  });
});
