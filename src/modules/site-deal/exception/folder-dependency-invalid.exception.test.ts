import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { FolderDependencyInvalidException } from './folder-dependency-invalid.exception';

describe('FolderDependencyInvalidException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new FolderDependencyInvalidException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new FolderDependencyInvalidException(message);

    expect(exception.name).toBe('FolderDependencyInvalidException');
  });

  it('is instance of Error', () => {
    expect(new FolderDependencyInvalidException(message)).toBeInstanceOf(Error);
  });
});
