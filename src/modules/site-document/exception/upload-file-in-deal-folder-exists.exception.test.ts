import { GraphException } from '@ukef/modules/graph/exception/graph.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { UploadFileInDealFolderExistsException } from './upload-file-in-deal-folder-exists.exception';

describe('UploadFileInDealFolderExistsException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new UploadFileInDealFolderExistsException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new UploadFileInDealFolderExistsException(message);

    expect(exception.name).toBe('UploadFileInDealFolderExistsException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new UploadFileInDealFolderExistsException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of GraphException', () => {
    expect(new UploadFileInDealFolderExistsException(message)).toBeInstanceOf(GraphException);
  });
});
