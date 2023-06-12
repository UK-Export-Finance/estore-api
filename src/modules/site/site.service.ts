import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { GraphService } from '@ukef/modules/graph/graph.service';

import { GraphGetSiteStatusByExporterNameResponseDto } from '../graph/dto/graph-get-site-status-by-exporter-name-response.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';

type RequiredConfigKeys = 'ukefSharepointName' | 'tfisSiteName' | 'tfisListId';

@Injectable()
export class SiteService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly graphService: GraphService,
  ) {}

  async getSiteStatusByExporterName(exporterName: string): Promise<GetSiteStatusByExporterNameResponse> {
    const data = await this.graphService.get<GraphGetSiteStatusByExporterNameResponseDto>({
      path: `sites/${this.config.ukefSharepointName}:/sites/${this.config.tfisSiteName}:/lists/${this.config.tfisListId}/items`,
      filter: `fields/Title eq '${exporterName}'`,
      expand: 'fields($select=Title,Url,SiteStatus)',
    });
    const { URL, Sitestatus } = data.value[0].fields;
    return { siteName: URL, status: Sitestatus };
  }
}
