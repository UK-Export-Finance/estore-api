import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GraphException } from './graph.exception';
import { GraphUnexpectedException } from './graph-unexpected.exception';

describe('GraphUnexpectedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GraphUnexpectedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GraphUnexpectedException(message);

    expect(exception.name).toBe('GraphUnexpectedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new GraphUnexpectedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of GraphException', () => {
    expect(new GraphUnexpectedException(message)).toBeInstanceOf(GraphException);
  });
});
