import { Injectable } from '@nestjs/common';
import GraphService from '@ukef/modules/graph/graph.service';

import { ListItem } from './list-item.interface';
import { ListItemFilter } from './list-item-filter/list-item-filter.interface';

@Injectable()
export class SharepointService {
  constructor(private readonly graphService: GraphService) {}
// TODO APIM-472 delete this file
  async findListItems<Fields>({
    siteUrl,
    listId,
    fieldsToReturn,
    filter,
  }: {
    siteUrl: string;
    listId: string;
    fieldsToReturn: (keyof Fields)[];
    filter: ListItemFilter;
  }): Promise<ListItem<Fields>[]> {
    const commaSeparatedListOfFieldsToReturn = fieldsToReturn.join(',');
    const { value: listItemsMatchingFilter } = await this.graphService.get<{ value: ListItem<Fields>[] }>({
      path: `${siteUrl}/lists/${listId}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });
    return listItemsMatchingFilter;
  }
}
