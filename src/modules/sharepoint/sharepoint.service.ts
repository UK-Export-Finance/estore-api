import { Injectable } from '@nestjs/common';
import GraphService from '@ukef/modules/graph/graph.service';

import { ListItem } from './list-item.interface';
import { ListItemFilter } from './list-item-filter/list-item-filter.interface';

@Injectable()
export class SharepointService {
  constructor(private readonly graphService: GraphService) {}

  async findListItems<FieldNames extends string>({
    siteUrl,
    listId,
    fieldsToReturn,
    filter,
  }: {
    siteUrl: string;
    listId: string;
    fieldsToReturn: FieldNames[];
    filter: ListItemFilter;
  }): Promise<ListItem<FieldNames>[]> {
    const commaSeparatedListOfFieldsToReturn = fieldsToReturn.join(',');
    const { value: listItemsMatchingFilter } = await this.graphService.get<{ value: ListItem<FieldNames>[] }>({
      path: `${siteUrl}/lists/${listId}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });
    return listItemsMatchingFilter;
  }
}
