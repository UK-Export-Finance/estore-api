import { GraphContentType } from './common/graph-content-type.dto';
import { GraphParentReference } from './common/graph-parent-reference.dto';
import { GraphSiteFields } from './common/graph-site-fields.dto';
import { GraphUser } from './common/graph-user.dto';

export interface GraphCreateSiteResponseDto {
  createdDateTime: Date;
  eTag: string;
  id: string;
  lastModifiedDateTime: Date;
  webUrl: string;
  createdBy: { user: GraphUser };
  lastModifiedBy: { user: GraphUser };
  parentReference: GraphParentReference;
  contentType: GraphContentType;
  fields: GraphSiteFields;
}
