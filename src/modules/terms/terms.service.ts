import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { RESPONSE } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';

type RequiredConfigKeys = 'ukefSharepointName' | 'tfisSiteName' | 'tfisTermStoreId';

@Injectable()
export class TermsService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly graphService: GraphService,
  ) {}

  async postFacilityToTermStore(id: string): Promise<any> {
    const requestBody = {
      fields: {
        Title: id,
      },
    };

    const { tfisTermStoreId, tfisSiteName, ukefSharepointName } = this.config;

    await this.graphService.post<any>({
      path: `sites/${ukefSharepointName}:/sites/${tfisSiteName}:/lists/${tfisTermStoreId}/items`,
      requestBody,
    });
    return { message: RESPONSE.FACILITY_TERM_CREATED };
  }
}
