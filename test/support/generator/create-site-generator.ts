import { UkefSiteId } from '@ukef/helpers/ukef-id.type';
import { GraphCreateSiteResponseDto } from '@ukef/modules/graph/dto/graph-create-site-response.dto';
import { CreateSiteRequest } from '@ukef/modules/site/dto/create-site-request.dto';
import { CreateSiteResponse } from '@ukef/modules/site/dto/create-site-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateSiteGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      //exporterName: this.valueGenerator.string(),
      exporterName: 'StaticCompany',
      //siteId: this.valueGenerator.string() as UkefSiteId,
      siteId: '07012345' as UkefSiteId,
      // graphCreatedDateTime: this.valueGenerator.date(),
      // graphETag: this.valueGenerator.string(),
      // graphId: this.valueGenerator.string(),
      // graphLastModifiedDateTime: this.valueGenerator.date(),
      // graphWebUrl: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    // const [siteValues] = values;
    const { ukefSharepointName, tfisSiteName, tfisListId } = options;

    // const graphCreatedBy = new graphUserGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    // const graphContentType = new graphContentTypeGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    // const graphLastModifiedBy = { ...graphCreatedBy };
    // const graphParentReference = new graphParentReferenceGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    // const graphSiteFields = new graphSiteFieldsGenerator(this.valueGenerator).generate({
    //   numberToGenerate: 1,
    //   title: siteValues.exporterName,
    //   url: siteValues.siteId,
    //   siteStatus: status,
    // });

    // const createSiteRequest: CreateSiteRequest = {
    //   exporterName: siteValues.exporterName,
    // };
    const createSiteRequest: CreateSiteRequest = values.map((value) => ({
      exporterName: value.exporterName,
    }));

    // const getSiteStatusByExporterNameServiceRequest: string = siteValues.exporterName;

    // const graphGetParams: GraphGetParams = {
    //   path: `sites/${ukefSharepointName}:/sites/${tfisSiteName}:/lists/${tfisListId}/items`,
    //   filter: `fields/Title eq '${siteValues.exporterName}'`,
    //   expand: 'fields($select=Title,Url,SiteStatus)',
    // };
    //const graphCreateSiteResponseDto: Partial<GraphCreateSiteResponseDto>[] = values.map((value) => ({
    const graphCreateSiteResponseDto = values.map((value) => ({
      fields: {
        Title: value.exporterName,
        Sitestatus: 'Provisioning',
        URL: value.siteId,
      },
    }));
    // const graphCreateSiteResponseDto: GraphCreateSiteResponseDto = {
    //   // createdDateTime: siteValues.graphCreatedDateTime,
    //   // eTag: siteValues.graphETag,
    //   // id: siteValues.graphId,
    //   // lastModifiedDateTime: siteValues.graphLastModifiedDateTime,
    //   // webUrl: siteValues.graphWebUrl,
    //   // createdBy: { user: graphCreatedBy },
    //   // lastModifiedBy: { user: graphLastModifiedBy },
    //   // parentReference: graphParentReference,
    //   // contentType: graphContentType,
    //   fields: graphSiteFields,
    // };

    // const createSiteResponse: CreateSiteResponse = {
    //   siteId: siteValues.siteId as UkefSiteId,
    //   status: 'Provisioning',
    // };

    const createSiteResponse: CreateSiteResponse[] = values.map((value) => ({
      siteId: value.siteId,
      status: 'Provisioning',
    }));

    const graphServicePostParams = values.map((value) => ({
      path: `sites/${ukefSharepointName}:/sites/${tfisSiteName}:/lists/${tfisListId}/items`,
      requestBody: {
        fields: {
          Title: value.exporterName,
          URL: value.siteId,
          HomePage: value.exporterName,
          Description: value.exporterName,
        },
      },
    }));

    return {
      createSiteRequest,
      // siteStatusByExporterNameServiceRequest: getSiteStatusByExporterNameServiceRequest,
      // graphServiceGetParams: graphGetParams,
      // graphGetSiteStatusResponseDto: graphGetSiteStatusByExporterNameResponseDto,
      graphServicePostParams,
      graphCreateSiteResponseDto,
      createSiteResponse,
    };
  }
}

interface GenerateValues {
  exporterName: string;
  siteId: UkefSiteId;
  // createdDateTime: Date;
  // eTag: string;
  // id: string;
  // lastModifiedDateTime: Date;
  // webUrl: string;
  // createdBy: { user: GraphUser };
  // lastModifiedBy: { user: GraphUser };
  // parentReference: GraphParentReference;
  // contentType: GraphContentType;
  // fields: GraphSiteFields;
}

interface GenerateResult {
  createSiteRequest: CreateSiteRequest;
  graphCreateSiteResponseDto: Partial<GraphCreateSiteResponseDto>[];
  createSiteResponse: CreateSiteResponse[];
  graphServicePostParams;
}

interface GenerateOptions {
  ukefSharepointName?: string;
  tfisSiteName?: string;
  tfisListId?: string;
  // exporterName: string;
  // siteId: string;
}
