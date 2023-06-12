import { GraphSiteFields } from '@ukef/modules/graph/dto/common/graph-site-fields.dto';

import { AbstractGenerator } from '../abstract-generator';
import { RandomValueGenerator } from '../random-value-generator';

export class graphSiteFieldsGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      title: this.valueGenerator.string(),
      url: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [siteValues] = values;
    const title = options.title ?? siteValues.title;
    const url = options.url ?? siteValues.url;
    const siteStatus = options.siteStatus ?? 'Provisioning';

    return {
      Title: title,
      URL: url,
      Sitestatus: siteStatus,
    };
  }
}

interface GenerateValues {
  title: string;
  url: string;
}

type GenerateResult = GraphSiteFields;

interface GenerateOptions {
  title?: string;
  url?: string;
  siteStatus?: string;
}
