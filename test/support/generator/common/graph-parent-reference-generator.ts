import { GraphParentReference } from '@ukef/modules/graph/dto/common/graph-parent-reference.dto';

import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

export class graphParentReferenceGenerator extends AbstractGenerator<GenerateValues, GenerateResult, unknown> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      id: this.valueGenerator.string(),
      siteId: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[]): GenerateResult {
    const [siteValues] = values;

    return {
      id: siteValues.id,
      siteId: siteValues.siteId,
    };
  }
}

type GenerateValues = GraphParentReference;

type GenerateResult = GraphParentReference;
