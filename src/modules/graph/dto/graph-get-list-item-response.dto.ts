import { GraphContentType } from './common/graph-content-type.dto';
import { GraphParentReference } from './common/graph-parent-reference.dto';
import { GraphUser } from './common/graph-user.dto';

export interface GraphGetListItemsResponseDto<ListItemFields> {
  value: GraphGetListItemsResponseItem<ListItemFields>[];
}

export interface GraphGetListItemsResponseItem<ListItemFields> {
  createdDateTime: Date;
  eTag: string;
  id: string;
  lastModifiedDateTime: Date;
  webUrl: string;
  createdBy: { user: GraphUser };
  lastModifiedBy: { user: GraphUser };
  parentReference: GraphParentReference;
  contentType: GraphContentType;
  fields: ListItemFields;
}
