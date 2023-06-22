import { GraphUser } from '@ukef/modules/graph/dto/common/graph-user.dto';

import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

export class graphUserGenerator extends AbstractGenerator<GenerateValues, GenerateResult, unknown> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      email: this.valueGenerator.string(),
      id: this.valueGenerator.string(),
      displayName: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[]): GenerateResult {
    const [siteValues] = values;

    const graphUser: GraphUser = {
      email: siteValues.email,
      id: siteValues.id,
      displayName: siteValues.displayName,
    };

    return graphUser;
  }
}

type GenerateValues = GraphUser;

type GenerateResult = GraphUser;
