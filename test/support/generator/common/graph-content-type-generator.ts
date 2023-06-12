import { GraphContentType } from '@ukef/modules/graph/dto/common/graph-content-type.dto';

import { AbstractGenerator } from '../abstract-generator';
import { RandomValueGenerator } from '../random-value-generator';

export class graphContentTypeGenerator extends AbstractGenerator<GenerateValues, GenerateResult, unknown> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      id: this.valueGenerator.string(),
      name: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[]): GenerateResult {
    const [siteValues] = values;

    return {
      id: siteValues.id,
      name: siteValues.name,
    };
  }
}

type GenerateValues = GraphContentType;

type GenerateResult = GraphContentType;
