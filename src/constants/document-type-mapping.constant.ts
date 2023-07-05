import { ENUMS } from './enum.constant';

const estoreDocumentTypeIdApplication = process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION;
const estoreDocumentTypeIdFinancialStatement = process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FINANCIAL_STATEMENT;
const estoreDocumentTypeIdBusinessInformation = process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_BUSINESS_INFORMATION;

export const DOCUMENT_TYPE_MAPPING = {
  [ENUMS.DOCUMENT_TYPES.EXPORTER_QUESTIONNAIRE]: {
    documentTitle: 'Supplementary Questionnaire',
    documentTypeId: estoreDocumentTypeIdApplication,
  },
  [ENUMS.DOCUMENT_TYPES.AUDITED_FINANCIAL_STATEMENTS]: {
    documentTitle: 'Annual Report',
    documentTypeId: estoreDocumentTypeIdFinancialStatement,
  },
  [ENUMS.DOCUMENT_TYPES.YEAR_TO_DATE_MANAGEMENT]: {
    documentTitle: 'Financial Statement',
    documentTypeId: estoreDocumentTypeIdFinancialStatement,
  },
  [ENUMS.DOCUMENT_TYPES.FINANCIAL_FORECASTS]: {
    documentTitle: 'Financial Forecast',
    documentTypeId: estoreDocumentTypeIdFinancialStatement,
  },
  [ENUMS.DOCUMENT_TYPES.FINANCIAL_INFORMATION_COMMENTARY]: {
    documentTitle: 'Financial Commentary',
    documentTypeId: estoreDocumentTypeIdFinancialStatement,
  },
  [ENUMS.DOCUMENT_TYPES.CORPORATE_STRUCTURE]: {
    documentTitle: 'Corporate Structure Diagram',
    documentTypeId: estoreDocumentTypeIdBusinessInformation,
  },
};
