import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { convertToEnum } from '@ukef/helpers';
import { GraphCreateSiteResponseDto } from '@ukef/modules/graph/dto/graph-create-site-response.dto';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { MdmCreateNumbersRequest } from '@ukef/modules/mdm/dto/mdm-create-numbers-request.dto';
import { MdmService } from '@ukef/modules/mdm/mdm.service';

import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { CreateSiteResponse } from './dto/create-site-response.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteNotFoundException } from './exception/site-not-found.exception';
type RequiredConfigKeys = 'tfisSharepointUrl' | 'tfisCaseSitesListId';

@Injectable()
export class SiteService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly graphService: GraphService,
    private readonly mdmService: MdmService,
  ) {}

  async getSiteStatusByExporterName(exporterName: string): Promise<GetSiteStatusByExporterNameResponse> {
    const { siteId, status } = await this.getSiteFromSitesList({
      exporterName,
      ifNotFound: () => {
        throw new SiteNotFoundException(`Site not found for exporter name: ${exporterName}`);
      },
    });

    return { siteId, status };
  }

  async createSiteIfDoesNotExist(exporterName: string): Promise<CreateSiteResponse> {
    const { siteId, status } = await this.getSiteFromSitesList({
      exporterName,
      ifNotFound: () => this.createSite(exporterName),
    });

    return { siteId, status };
  }

  async createSiteId(): Promise<string> {
    const requestToCreateSiteId: MdmCreateNumbersRequest = this.buildRequestToCreateSiteId();
    const [{ maskedId: createdSiteId }] = await this.mdmService.createNumbers(requestToCreateSiteId);
    return createdSiteId;
  }

  private async createSite(exporterName: string): Promise<CreateSiteResponse> {
    const newSiteId = await this.createSiteId();
    const data = await this.graphService.post<GraphCreateSiteResponseDto>({
      path: `${this.sharepointConfig.tfisSharepointUrl}/lists/${this.sharepointConfig.tfisCaseSitesListId}/items`,
      requestBody: {
        fields: {
          Title: exporterName,
          URL: newSiteId,
          HomePage: exporterName,
          Description: exporterName,
        },
      },
    });

    const { URL: siteId, Sitestatus: siteStatus } = data.fields;

    const status = convertToEnum<typeof SiteStatusEnum>(siteStatus, SiteStatusEnum);

    return { siteId: siteId, status };
  }

  private async getSiteFromSitesList({ exporterName, ifNotFound }): Promise<GetSiteStatusByExporterNameResponse | CreateSiteResponse> {
    const sharepointService = new SharepointService(this.graphService); // TODO APIM-136: inject sharepoint service instead
    const listItems = await sharepointService.findListItems<{ Title: string; URL: string; Sitestatus: string }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['Title', 'URL', 'Sitestatus'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });
    if (!listItems.length) {
      return ifNotFound();
    }
    const { URL: siteId, Sitestatus: siteStatus } = listItems[0].fields;

    const status = convertToEnum<typeof SiteStatusEnum>(siteStatus, SiteStatusEnum);

    return { siteId: siteId, status };
  }

  private buildRequestToCreateSiteId(): MdmCreateNumbersRequest {
    const applicationNameToCreateSiteIdWith = 'Estore';
    return [
      {
        numberTypeId: 6,
        createdBy: applicationNameToCreateSiteIdWith,
        requestingSystem: applicationNameToCreateSiteIdWith,
      },
    ];
  }
}
