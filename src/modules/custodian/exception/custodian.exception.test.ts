import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CustodianException } from './custodian.exception';

describe('CustodianException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new CustodianException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new CustodianException(message);

    expect(exception.name).toBe('CustodianException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new CustodianException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
