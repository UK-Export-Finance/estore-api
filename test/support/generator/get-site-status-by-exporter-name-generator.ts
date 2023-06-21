import { GraphGetSiteStatusByExporterNameResponseDto } from '@ukef/modules/graph/dto/graph-get-site-status-by-exporter-name-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { GetSiteStatusByExporterNameQueryDto } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-response.dto';
import { graphContentTypeGenerator } from '@ukef-test/support/generator/common/graph-content-type-generator';
import { graphParentReferenceGenerator } from '@ukef-test/support/generator/common/graph-parent-reference-generator';
import { graphSiteFieldsGenerator } from '@ukef-test/support/generator/common/graph-site-fields-generator';
import { graphUserGenerator } from '@ukef-test/support/generator/common/graph-user-generator';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class getSiteStatusByExporterNameGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      exporterName: this.valueGenerator.word(),
      siteId: this.valueGenerator.string(),
      graphCreatedDateTime: this.valueGenerator.date(),
      graphETag: this.valueGenerator.string(),
      graphId: this.valueGenerator.string(),
      graphLastModifiedDateTime: this.valueGenerator.date(),
      graphWebUrl: this.valueGenerator.httpsUrl(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [siteValues] = values;
    const ukefSharepointName = ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME + '.sharepoint.com';
    const tfisSiteName = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME;
    const tfisListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_LIST_ID;
    const status = options.status ?? 'Provisioning';

    const graphCreatedBy = new graphUserGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphContentType = new graphContentTypeGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphLastModifiedBy = { ...graphCreatedBy };
    const graphParentReference = new graphParentReferenceGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const graphSiteFields = new graphSiteFieldsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      title: siteValues.exporterName,
      url: siteValues.siteId,
      siteStatus: status,
    });

    const getSiteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto = {
      exporterName: siteValues.exporterName,
    };

    const getSiteStatusByExporterNameServiceRequest: string = siteValues.exporterName;

    const graphGetParams: GraphGetParams = {
      path: `sites/${ukefSharepointName}:/sites/${tfisSiteName}:/lists/${tfisListId}/items`,
      filter: `fields/Title eq '${siteValues.exporterName}'`,
      expand: 'fields($select=Title,Url,SiteStatus)',
    };

    const graphGetSiteStatusByExporterNameResponseDto: GraphGetSiteStatusByExporterNameResponseDto = {
      value: [
        {
          createdDateTime: siteValues.graphCreatedDateTime,
          eTag: siteValues.graphETag,
          id: siteValues.graphId,
          lastModifiedDateTime: siteValues.graphLastModifiedDateTime,
          webUrl: siteValues.graphWebUrl,
          createdBy: { user: graphCreatedBy },
          lastModifiedBy: { user: graphLastModifiedBy },
          parentReference: graphParentReference,
          contentType: graphContentType,
          fields: graphSiteFields,
        },
      ],
    };

    const getSiteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse = {
      siteId: siteValues.siteId,
      status,
    };

    return {
      siteStatusByExporterNameQueryDto: getSiteStatusByExporterNameQueryDto,
      siteStatusByExporterNameServiceRequest: getSiteStatusByExporterNameServiceRequest,
      graphServiceGetParams: graphGetParams,
      graphGetSiteStatusResponseDto: graphGetSiteStatusByExporterNameResponseDto,
      siteStatusByExporterNameResponse: getSiteStatusByExporterNameResponse,
    };
  }
}

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
  siteStatusByExporterNameQueryDto: GetSiteStatusByExporterNameQueryDto;
  siteStatusByExporterNameServiceRequest: string;
  graphServiceGetParams: GraphGetParams;
  graphGetSiteStatusResponseDto: GraphGetSiteStatusByExporterNameResponseDto;
  siteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse;
}

interface GenerateOptions {
  status?: string;
}
