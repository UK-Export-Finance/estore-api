import { ENUMS } from '@ukef/constants';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { convertToEnum } from '@ukef/helpers';
import { UkefSiteId } from '@ukef/helpers/ukef-id.type';
import { GraphGetSiteStatusByExporterNameResponseDto } from '@ukef/modules/graph/dto/graph-get-site-status-by-exporter-name-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { GetSiteStatusByExporterNameQueryDto } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-response.dto';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';

import { AbstractGenerator } from './abstract-generator';
import { graphContentTypeGenerator } from './common/graph-content-type-generator';
import { graphParentReferenceGenerator } from './common/graph-parent-reference-generator';
import { graphSiteFieldsGenerator } from './common/graph-site-fields-generator';
import { graphUserGenerator } from './common/graph-user-generator';
import { RandomValueGenerator } from './random-value-generator';

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
      `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}`;
    const tfisCaseSitesListId = options.tfisCaseSitesListId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const status = options.status ?? ENUMS.SITE_STATUSES.PROVISIONING;

    const graphCreatedByUser = new graphUserGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphContentType = new graphContentTypeGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphLastModifiedByUser = { ...graphCreatedByUser };
    const graphParentReference = new graphParentReferenceGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphSiteFields = new graphSiteFieldsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      title: siteValues.exporterName,
      url: siteValues.siteId,
      siteStatus: status,
    });

    const siteControllerGetSiteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto = {
      exporterName: siteValues.exporterName,
    };

    const siteServiceGetSiteStatusByExporterNameRequest: string = siteValues.exporterName;

    const graphServiceGetParams: GraphGetParams = {
      path: `${tfisSharepointUrl}:/lists/${tfisCaseSitesListId}/items`,
      filter: `fields/Title eq '${siteValues.exporterName}'`,
      expand: 'fields($select=Title,URL,Sitestatus)',
    };

    const graphServiceGetSiteStatusByExporterNameResponseDto: GraphGetSiteStatusByExporterNameResponseDto = {
      value: [
        {
          createdDateTime: siteValues.graphCreatedDateTime,
          eTag: siteValues.graphETag,
          id: siteValues.graphId,
          lastModifiedDateTime: siteValues.graphLastModifiedDateTime,
          webUrl: siteValues.graphWebUrl,
          createdBy: { user: graphCreatedByUser },
          lastModifiedBy: { user: graphLastModifiedByUser },
          parentReference: graphParentReference,
          contentType: graphContentType,
          fields: graphSiteFields,
        },
      ],
    };

    const siteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse = {
      siteId: siteValues.siteId,
      status: convertToEnum(status, SiteStatusEnum),
    };

    return {
      siteControllerGetSiteStatusByExporterNameQueryDto,
      siteServiceGetSiteStatusByExporterNameRequest,
      graphServiceGetParams,
      graphServiceGetSiteStatusByExporterNameResponseDto,
      siteStatusByExporterNameResponse,
    };
  }
}

interface GenerateValues {
  exporterName: string;
  siteId: UkefSiteId;
  graphCreatedDateTime: Date;
  graphETag: string;
  graphId: string;
  graphLastModifiedDateTime: Date;
  graphWebUrl: string;
}

interface GenerateResult {
  siteControllerGetSiteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto;
  siteServiceGetSiteStatusByExporterNameRequest: string;
  graphServiceGetParams: GraphGetParams;
  graphServiceGetSiteStatusByExporterNameResponseDto: GraphGetSiteStatusByExporterNameResponseDto;
  siteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse;
}

interface GenerateOptions {
  status?: string;
  tfisSharepointUrl?: string;
  tfisCaseSitesListId?: string;
}
