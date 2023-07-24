import { ENUMS } from '@ukef/constants';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { convertToEnum } from '@ukef/helpers';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { GetSiteStatusByExporterNameQueryDto } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-response.dto';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';
import { GraphListItemsGenerator } from './common/graph-list-items-generator';
import { GraphGetListItemsResponseItem, GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';

export class getSiteStatusByExporterNameGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      exporterName: this.valueGenerator.word(),
      siteId: this.valueGenerator.ukefSiteId(),
      graphCreatedDateTime: this.valueGenerator.date(),
      graphETag: this.valueGenerator.string(),
      graphId: this.valueGenerator.string(),
      graphLastModifiedDateTime: this.valueGenerator.date(),
      graphWebUrl: this.valueGenerator.httpsUrl(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [siteValues] = values;
    const tfisSharepointUrl =
      options.tfisSharepointUrl ??
      `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}:`;
    const tfisCaseSitesListId = options.tfisCaseSitesListId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const status = options.status ?? ENUMS.SITE_STATUSES.PROVISIONING;

    const getExporterSiteResponseFields = {
      Title: siteValues.exporterName,
      URL: siteValues.siteId,
      Sitestatus: status,
    };

    const siteControllerGetSiteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto = {
      exporterName: siteValues.exporterName,
    };

    const siteServiceGetSiteStatusByExporterNameRequest: string = siteValues.exporterName;

    const graphServiceGetParams: GraphGetParams = {
      path: `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`,
      filter: `fields/Title eq '${siteValues.exporterName}'`,
      expand: 'fields($select=Title,URL,Sitestatus)',
    };

    const graphServiceGetResponse: GraphGetListItemsResponseDto<GetExporterSiteResponseFields> = new GraphListItemsGenerator<GetExporterSiteResponseFields>(
      this.valueGenerator,
    ).generate({
      numberToGenerate: 1,
      graphListItemsFields: getExporterSiteResponseFields,
    });

    const sharepointServiceGetExporterSiteParams: string = siteValues.exporterName;

    const sharepointServiceGetExporterSiteResponse: GraphGetListItemsResponseItem<GetExporterSiteResponseFields>[] = graphServiceGetResponse.value;

    const siteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse = {
      siteId: siteValues.siteId,
      status: convertToEnum(status, SiteStatusEnum),
    };

    return {
      siteControllerGetSiteStatusByExporterNameQueryDto,
      siteServiceGetSiteStatusByExporterNameRequest,
      sharepointServiceGetExporterSiteParams,
      sharepointServiceGetExporterSiteResponse,
      graphServiceGetParams,
      graphServiceGetResponse,
      siteStatusByExporterNameResponse,
    };
  }
}

type GetExporterSiteResponseFields = {
  Title: string;
  URL: string;
  Sitestatus: string;
};

interface GenerateValues {
  exporterName: string;
  siteId: string;
  graphCreatedDateTime: Date;
  graphETag: string;
  graphId: string;
  graphLastModifiedDateTime: Date;
  graphWebUrl: string;
}

interface GenerateResult {
  siteControllerGetSiteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto;
  siteServiceGetSiteStatusByExporterNameRequest: string;
  sharepointServiceGetExporterSiteParams: string;
  sharepointServiceGetExporterSiteResponse: GraphGetListItemsResponseItem<GetExporterSiteResponseFields>[];
  graphServiceGetParams: GraphGetParams;
  graphServiceGetResponse: GraphGetListItemsResponseDto<GetExporterSiteResponseFields>;
  siteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse;
}

interface GenerateOptions {
  status?: string;
  tfisSharepointUrl?: string;
  tfisCaseSitesListId?: string;
}
