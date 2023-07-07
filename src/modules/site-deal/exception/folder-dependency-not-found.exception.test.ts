import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { FolderDependencyNotFoundException } from './folder-dependency-not-found.exception';

describe('FolderDependencyNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new FolderDependencyNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new FolderDependencyNotFoundException(message);

    expect(exception.name).toBe('FolderDependencyNotFoundException');
  });

  it('is instance of Error', () => {
    expect(new FolderDependencyNotFoundException(message)).toBeInstanceOf(Error);
  });
});
