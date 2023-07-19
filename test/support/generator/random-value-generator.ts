import { UKEFID } from '@ukef/constants';
import { ALLOWED_DOCUMENT_FILE_TYPE } from '@ukef/constants/allowed-document-file-type.constant';
import { UkefId } from '@ukef/helpers';
import { Chance } from 'chance';

interface Enum {
  [key: number | string]: string | number;
}

export class RandomValueGenerator {
  private static readonly seed = 0;
  private readonly chance: Chance.Chance;

  constructor() {
    this.chance = new Chance(RandomValueGenerator.seed);
  }

  boolean(): boolean {
    return this.chance.bool();
  }

  string(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const length = this.getStringLengthFromOptions(options);
    return this.chance.string({ length });
  }

  stringOfNumericCharacters(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const length = this.getStringLengthFromOptions(options);
    return this.chance.string({ length, pool: '0123456789' });
  }

  exporterName(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const length = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: 1, max: 250 });
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._() ';
    return this.chance.string({ length, pool });
  }

  ukefSiteId(length?: number): string {
    return this.word({ length });
  }

  private getStringLengthFromOptions(options?: { length?: number; minLength?: number; maxLength?: number }): number {
    const minLength = options && (options.minLength || options.minLength === 0) ? options.minLength : 0;
    const maxLength = options && (options.maxLength || options.maxLength === 0) ? options.maxLength : Math.max(20, minLength * 2);
    const length = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: minLength, max: maxLength });
    return length;
  }

  word(options?: { length?: number }): string {
    return this.chance.word({ length: options?.length });
  }

  httpsUrl(): string {
    return this.chance.url({ protocol: 'https' });
  }

  character(): string {
    return this.chance.character();
  }

  probabilityFloat(): number {
    return this.chance.floating({ min: 0, max: 1 });
  }

  nonnegativeFloat(options?: { max?: number; fixed?: number }): number {
    const min = 0;
    // Fixed is for number of decimal places.
    const fixed = options && options.fixed ? options.fixed : 2;
    return options && options.max ? this.chance.floating({ min, fixed: fixed, max: options.max }) : this.chance.floating({ min, fixed: fixed });
  }

  date(): Date {
    return this.chance.date();
  }

  integer({ min, max }: { min?: number; max?: number } = {}): number {
    return this.chance.integer({ min, max });
  }

  nonnegativeInteger({ max }: { max?: number } = {}): number {
    return this.integer({ min: 0, max });
  }

  // UKEF id example 0030000321. It should be used for Deal and Facility IDs.
  ukefId(lengthExcludingPrefix?: number): UkefId {
    return UKEFID.MAIN_ID.PREFIX.DEV.concat(this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as UkefId;
  }

  facilityId(lengthExcludingPrefix?: number): UkefId {
    return this.ukefId(lengthExcludingPrefix ?? 6);
  }

  guid(): string {
    return this.chance.guid();
  }

  enumValue<T = string>(theEnum: Enum): T {
    const possibleValues = Object.values(theEnum);
    return possibleValues[this.integer({ min: 0, max: possibleValues.length - 1 })] as T;
  }

  buyerName(options?: { length?: number }) {
    const length = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: 1, max: 250 });
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_()';
    return this.chance.string({ length, pool });
  }

  fileName(options?: { length?: number; lengthOfExtension?: number }) {
    const totalLength = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: 5, max: 250 });
    const lengthOfExtension = totalLength < 6 ? 3 : this.chance.integer({ min: 3, max: 4 });
    const possibleExtensions = Object.values(ALLOWED_DOCUMENT_FILE_TYPE).filter((extension) => extension.length === lengthOfExtension);
    const randomExtension = this.arrayElement(possibleExtensions);
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_()';
    return `${this.chance.string({ length: totalLength - lengthOfExtension - 1, pool })}.${randomExtension}`;
  }

  arrayElement<T>(array: T[]): T {
    const randomIndex = this.nonnegativeInteger({ max: array.length - 1 });
    return array[randomIndex];
  }

  fileLocationPath(options?: { length?: number }) {
    const length = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: 1, max: 250 });
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_():/\\ ';
    return this.chance.string({ length, pool });
  }
}
