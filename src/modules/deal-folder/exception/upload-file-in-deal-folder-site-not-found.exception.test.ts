import { GraphException } from '@ukef/modules/graph/exception/graph.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { UploadFileInDealFolderSiteNotFoundException } from './upload-file-in-deal-folder-site-not-found.exception';

describe('UploadFileInDealFolderSiteNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new UploadFileInDealFolderSiteNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new UploadFileInDealFolderSiteNotFoundException(message);

    expect(exception.name).toBe('UploadFileInDealFolderSiteNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new UploadFileInDealFolderSiteNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of GraphException', () => {
    expect(new UploadFileInDealFolderSiteNotFoundException(message)).toBeInstanceOf(GraphException);
  });
});
