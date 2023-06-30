import { UkefId, UkefSiteId } from '@ukef/helpers';
import { CreateFacilityFolderParamsDto } from '@ukef/modules/site-deal/dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from '@ukef/modules/site-deal/dto/create-facility-folder-request.dto';
import { CreateFacilityFolderResponseDto } from '@ukef/modules/site-deal/dto/create-facility-folder-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityFolderGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    const facilityIdentifier = this.valueGenerator.word();
    return {
      siteId: this.valueGenerator.ukefSiteId(),
      dealId: this.valueGenerator.ukefId(),

      exporterName: this.valueGenerator.word(),
      buyerName: this.valueGenerator.word(),
      facilityIdentifier,
      destinationMarket: this.valueGenerator.word(),
      riskMarket: this.valueGenerator.word(),

      folderName: `F ${facilityIdentifier}`,
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [createFacilityFolderValues] = values;

    const siteId = options.siteId ?? createFacilityFolderValues.siteId;
    const dealId = options.dealId ?? createFacilityFolderValues.dealId;

    const createFacilityFolderParamsDto: CreateFacilityFolderParamsDto = {
      siteId,
      dealId,
    };

    const createFacilityFolderRequestItem: CreateFacilityFolderRequestItem = {
      exporterName: createFacilityFolderValues.exporterName,
      buyerName: createFacilityFolderValues.buyerName,
      facilityIdentifier: createFacilityFolderValues.facilityIdentifier,
      destinationMarket: createFacilityFolderValues.destinationMarket,
      riskMarket: createFacilityFolderValues.riskMarket,
    };

    const createFacilityFolderRequestDto: CreateFacilityFolderRequestDto = [createFacilityFolderRequestItem];

    const createFacilityFolderResponseDto: CreateFacilityFolderResponseDto = {
      folderName: createFacilityFolderValues.folderName,
    };

    return {
      createFacilityFolderParamsDto,
      createFacilityFolderRequestItem,
      createFacilityFolderRequestDto,
      createFacilityFolderResponseDto,
    };
  }
}

interface GenerateValues {
  siteId: UkefSiteId;
  dealId: UkefId;

  exporterName: string;
  buyerName: string;
  facilityIdentifier: string;
  destinationMarket: string;
  riskMarket: string;

  folderName: string;
}

interface GenerateResult {
  createFacilityFolderParamsDto: CreateFacilityFolderParamsDto;
  createFacilityFolderRequestItem: CreateFacilityFolderRequestItem;
  createFacilityFolderRequestDto: CreateFacilityFolderRequestDto;
  createFacilityFolderResponseDto: CreateFacilityFolderResponseDto;
}

interface GenerateOptions {
  siteId?: UkefSiteId;
  dealId?: UkefId;
}
