import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GraphContentTypeGenerator } from './graph-content-type-generator';
import { GraphParentReferenceGenerator } from './graph-parent-reference-generator';
import { GraphUserGenerator } from './graph-user-generator';

export class GraphListItemsGenerator<ListItemFields> extends AbstractGenerator<
  GenerateValues,
  GenerateResult<ListItemFields>,
  GenerateOptions<ListItemFields>
> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      facilityTermDateResponseCreatedDateTime: this.valueGenerator.date(),
      facilityTermDateResponseETag: this.valueGenerator.string(),
      facilityTermDateResponseId: this.valueGenerator.stringOfNumericCharacters(),
      facilityTermDateResponseLastModifiedDateTime: this.valueGenerator.date(),
      facilityTermDateResponseWebUrl: this.valueGenerator.httpsUrl(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions<ListItemFields>): GenerateResult<ListItemFields> {
    const [createFacilityFolderValues] = values;

    const facilityTermDateResponseCreatedByUser = new GraphUserGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const facilityTermDateResponseLastModifiedByUser = { ...facilityTermDateResponseCreatedByUser };
    const facilityTermDateResponseParentReference = new GraphParentReferenceGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const facilityTermDateContentType = new GraphContentTypeGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });

    return {
      value: [
        {
          createdDateTime: createFacilityFolderValues.facilityTermDateResponseCreatedDateTime,
          eTag: createFacilityFolderValues.facilityTermDateResponseETag,
          id: createFacilityFolderValues.facilityTermDateResponseId,
          lastModifiedDateTime: createFacilityFolderValues.facilityTermDateResponseLastModifiedDateTime,
          webUrl: createFacilityFolderValues.facilityTermDateResponseWebUrl,
          createdBy: { user: facilityTermDateResponseCreatedByUser },
          lastModifiedBy: { user: facilityTermDateResponseLastModifiedByUser },
          parentReference: facilityTermDateResponseParentReference,
          contentType: facilityTermDateContentType,
          fields: { id: createFacilityFolderValues.facilityTermDateResponseId, ...options.graphListItemsFields },
        },
      ],
    };
  }
}

type GenerateValues = {
  facilityTermDateResponseCreatedDateTime: Date;
  facilityTermDateResponseETag: string;
  facilityTermDateResponseId: string;
  facilityTermDateResponseLastModifiedDateTime: Date;
  facilityTermDateResponseWebUrl: string;
};

type GenerateResult<ListItemFields> = GraphGetListItemsResponseDto<{ id: string } & ListItemFields>;

type GenerateOptions<ListItemFields> = {
  graphListItemsFields: ListItemFields;
};
