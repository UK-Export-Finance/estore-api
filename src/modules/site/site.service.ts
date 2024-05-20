import { Injectable } from '@nestjs/common';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { convertToEnum } from '@ukef/helpers';
import { MdmCreateNumbersRequest } from '@ukef/modules/mdm/dto/mdm-create-numbers-request.dto';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';

import { CreateSiteResponse } from './dto/create-site-response.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteNotFoundException } from './exception/site-not-found.exception';

@Injectable()
export class SiteService {
  constructor(
    private readonly sharepointService: SharepointService,
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
    const data = await this.sharepointService.createSite({ exporterName, newSiteId });
    const { URL: siteId, Sitestatus: siteStatus } = data.fields;

    const status = convertToEnum<typeof SiteStatusEnum>(siteStatus, SiteStatusEnum);

    return { siteId, status };
  }

  private async getSiteFromSitesList({ exporterName, ifNotFound }): Promise<GetSiteStatusByExporterNameResponse | CreateSiteResponse> {
    const listItems = await this.sharepointService.getExporterSiteByName(exporterName);

    if (!listItems.length) {
      return ifNotFound();
    }
    const { URL: siteId, Sitestatus: siteStatus } = listItems[0].fields;

    const status = convertToEnum<typeof SiteStatusEnum>(siteStatus, SiteStatusEnum);

    return { siteId, status };
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
