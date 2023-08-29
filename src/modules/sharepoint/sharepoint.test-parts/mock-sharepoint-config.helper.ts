import { SharepointConfig } from '@ukef/config/sharepoint.config';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

export const getMockSharepointConfig = (): SharepointConfig => {
  const valueGenerator = new RandomValueGenerator();
  return {
    baseUrl: valueGenerator.word(),
    ukefSharepointName: valueGenerator.word(),
    tfisSharepointUrl: valueGenerator.word(),
    scSharepointUrl: valueGenerator.word(),
    scSiteFullUrl: valueGenerator.word(),
    scCaseSitesListId: valueGenerator.word(),
    tfisFacilityListId: valueGenerator.word(),
    tfisFacilityListTitle: valueGenerator.word(),
    tfisFacilityHiddenListTermStoreId: valueGenerator.word(),
    tfisDealListId: valueGenerator.word(),
    tfisCaseSitesListId: valueGenerator.word(),
    taxonomyHiddenListTermStoreListId: valueGenerator.word(),
    estoreDocumentTypeIdFieldName: valueGenerator.word(),
    estoreDocumentTypeIdApplication: valueGenerator.word(),
    estoreDocumentTypeIdFinancialStatement: valueGenerator.word(),
    estoreDocumentTypeIdBusinessInformation: valueGenerator.word(),
    ecmsDocumentContentTypeId: valueGenerator.word(),
  };
};
