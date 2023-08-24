import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DocumentTypeMapper } from './document-type-mapper';

describe('DocumentTypeMapper', () => {
  const valueGenerator = new RandomValueGenerator();
  const applicationDocumentTypeId = valueGenerator.string();
  const financialStatementDocumentTypeId = valueGenerator.string();
  const businessInformationDocumentTypeId = valueGenerator.string();

  let mapper: DocumentTypeMapper;

  beforeEach(() => {
    mapper = new DocumentTypeMapper({
      estoreDocumentTypeIdApplication: applicationDocumentTypeId,
      estoreDocumentTypeIdFinancialStatement: financialStatementDocumentTypeId,
      estoreDocumentTypeIdBusinessInformation: businessInformationDocumentTypeId,
    });
  });

  describe('mapDocumentTypeToTitleAndTypeId', () => {
    const documentTypesAndExpectedValues = [
      {
        documentType: DocumentTypeEnum.EXPORTER_QUESTIONNAIRE,
        expectedDocumentTitle: 'Supplementary Questionnaire',
        descriptionOfExpectedDocumentTypeId: 'application',
        expectedDocumentTypeId: applicationDocumentTypeId,
      },
      {
        documentType: DocumentTypeEnum.AUDITED_FINANCIAL_STATEMENTS,
        expectedDocumentTitle: 'Annual Report',
        descriptionOfExpectedDocumentTypeId: 'financial statement',
        expectedDocumentTypeId: financialStatementDocumentTypeId,
      },
      {
        documentType: DocumentTypeEnum.YEAR_TO_DATE_MANAGEMENT,
        expectedDocumentTitle: 'Financial Statement',
        descriptionOfExpectedDocumentTypeId: 'financial statement',
        expectedDocumentTypeId: financialStatementDocumentTypeId,
      },
      {
        documentType: DocumentTypeEnum.FINANCIAL_FORECASTS,
        expectedDocumentTitle: 'Financial Forecast',
        descriptionOfExpectedDocumentTypeId: 'financial statement',
        expectedDocumentTypeId: financialStatementDocumentTypeId,
      },
      {
        documentType: DocumentTypeEnum.FINANCIAL_INFORMATION_COMMENTARY,
        expectedDocumentTitle: 'Financial Commentary',
        descriptionOfExpectedDocumentTypeId: 'financial statement',
        expectedDocumentTypeId: financialStatementDocumentTypeId,
      },
      {
        documentType: DocumentTypeEnum.CORPORATE_STRUCTURE,
        expectedDocumentTitle: 'Corporate Structure Diagram',
        descriptionOfExpectedDocumentTypeId: 'business information',
        expectedDocumentTypeId: businessInformationDocumentTypeId,
      },
    ];

    it.each(documentTypesAndExpectedValues)('maps $documentType to the document title $expectedDocumentTitle', ({ documentType, expectedDocumentTitle }) => {
      const { documentTitle } = mapper.mapDocumentTypeToTitleAndTypeId(documentType);

      expect(documentTitle).toBe(expectedDocumentTitle);
    });

    it.each(documentTypesAndExpectedValues)(
      'maps $documentType to the document type id for $descriptionOfExpectedDocumentTypeId documents',
      ({ documentType, expectedDocumentTypeId }) => {
        const { documentTypeId } = mapper.mapDocumentTypeToTitleAndTypeId(documentType);

        expect(documentTypeId).toBe(expectedDocumentTypeId);
      },
    );

    it('returns undefined if the document type is not recognised', () => {
      const mapperResult = mapper.mapDocumentTypeToTitleAndTypeId('not a real document type' as DocumentTypeEnum);

      expect(mapperResult).toBeUndefined();
    });
  });
});
