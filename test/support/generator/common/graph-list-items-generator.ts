import { GraphListItemFields } from '@ukef/modules/graph/dto/common/graph-list-item-fields.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { graphContentTypeGenerator } from './graph-content-type-generator';
import { graphParentReferenceGenerator } from './graph-parent-reference-generator';
import { graphUserGenerator } from './graph-user-generator';

export class GraphListItemsGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
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

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [createFacilityFolderValues] = values;

    const facilityTermDateResponseCreatedByUser = new graphUserGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const facilityTermDateResponseLastModifiedByUser = { ...facilityTermDateResponseCreatedByUser };
    const facilityTermDateResponseParentReference = new graphParentReferenceGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });
    const facilityTermDateContentType = new graphContentTypeGenerator(this.valueGenerator).generate({ numberToGenerate: 1 });

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
          // TODO APIM-136: Why do we always return an id field?
          fields: { id: createFacilityFolderValues.facilityTermDateResponseId, ...options.graphListItemsFields },
        },
      ],
    };
  }
}

interface GenerateValues {
  facilityTermDateResponseCreatedDateTime: Date;
  facilityTermDateResponseETag: string;
  facilityTermDateResponseId: string;
  facilityTermDateResponseLastModifiedDateTime: Date;
  facilityTermDateResponseWebUrl: string;
}

type GenerateResult = GraphGetListItemsResponseDto;

interface GenerateOptions {
  graphListItemsFields: GraphListItemFields;
}
