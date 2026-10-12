import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { regexToString } from '@ukef/helpers';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

type Options = {
  description: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  enum?: any;
  example?: string;
  default?: string;
};

export const ValidatedStringApiProperty = ({
  description,
  length,
  minLength,
  maxLength,
  required,
  pattern,
  enum: theEnum,
  example,
  default: theDefault,
}: Options) => {
  const resolvedMinLength = length ?? minLength ?? 0;
  const resolvedMaxLength = length ?? maxLength;
  const decoratorsToApply = [
    ApiProperty({
      type: 'string',
      description,
      minLength: resolvedMinLength,
      maxLength: resolvedMaxLength,
      required,
      pattern: pattern ? regexToString(pattern) : undefined,
      enum: theEnum,
      example,
      default: theDefault,
    }),
    IsString(),
    Length(resolvedMinLength, resolvedMaxLength),
  ];

  const isRequiredProperty = required ?? true;

  if (!isRequiredProperty) {
    decoratorsToApply.push(IsOptional());
  }

  if (pattern) {
    decoratorsToApply.push(Matches(pattern));
  }

  if (theEnum) {
    decoratorsToApply.push(IsEnum(theEnum));
  }

  return applyDecorators(...decoratorsToApply);
};
