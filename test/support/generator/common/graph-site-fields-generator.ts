import { GraphSiteFields } from '@ukef/modules/graph/dto/common/graph-site-fields.dto';
import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { ENUMS } from '@ukef/constants';

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
  const siteStatus = options.siteStatus ?? ENUMS.SITE_STATUSES.PROVISIONING;

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
