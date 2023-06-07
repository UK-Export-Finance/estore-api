import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GraphAuthenticationFailedException } from './graph-authentication-failed.exception';

describe('GraphAuthenticationFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GraphAuthenticationFailedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GraphAuthenticationFailedException(message);

    expect(exception.name).toBe('GraphAuthenticationFailedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new GraphAuthenticationFailedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
