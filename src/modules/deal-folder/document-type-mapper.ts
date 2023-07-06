import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { ENUMS } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
type RequiredConfigKeys = 'estoreDocumentTypeIdApplication' | 'estoreDocumentTypeIdFinancialStatement' | 'estoreDocumentTypeIdBusinessInformation';

@Injectable()
export class DocumentTypeMapper {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
  ) {}

  mapDocumentTypeToTitleAndTypeId(documentType: DocumentTypeEnum): { documentTitle: string; documentTypeId: string } {
    let result: { documentTitle: string; documentTypeId: string };
    switch (documentType) {
      case ENUMS.DOCUMENT_TYPES.EXPORTER_QUESTIONNAIRE:
        result = {
          documentTitle: 'Supplementary Questionnaire',
          documentTypeId: this.config.estoreDocumentTypeIdApplication,
        };
        break;
      case ENUMS.DOCUMENT_TYPES.AUDITED_FINANCIAL_STATEMENTS:
        result = {
          documentTitle: 'Annual Report',
          documentTypeId: this.config.estoreDocumentTypeIdFinancialStatement,
        };
        break;
      case ENUMS.DOCUMENT_TYPES.YEAR_TO_DATE_MANAGEMENT:
        result = {
          documentTitle: 'Financial Statement',
          documentTypeId: this.config.estoreDocumentTypeIdFinancialStatement,
        };
        break;
      case ENUMS.DOCUMENT_TYPES.FINANCIAL_FORECASTS:
        result = {
          documentTitle: 'Financial Forecast',
          documentTypeId: this.config.estoreDocumentTypeIdFinancialStatement,
        };
        break;
      case ENUMS.DOCUMENT_TYPES.FINANCIAL_INFORMATION_COMMENTARY:
        result = {
          documentTitle: 'Financial Commentary',
          documentTypeId: this.config.estoreDocumentTypeIdFinancialStatement,
        };
        break;
      case ENUMS.DOCUMENT_TYPES.CORPORATE_STRUCTURE:
        result = {
          documentTitle: 'Corporate Structure Diagram',
          documentTypeId: this.config.estoreDocumentTypeIdBusinessInformation,
        };
        break;
      default:
        break;
    }

    return result;
  }
}
