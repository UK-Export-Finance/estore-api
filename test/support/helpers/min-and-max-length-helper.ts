export const getMinAndMaxLengthFromOptions = ({
  parameterName,
  minLengthOption,
  maxLengthOption,
  lengthOption,
  theEnum,
}: {
  parameterName: string;
  minLengthOption?: number;
  maxLengthOption?: number;
  lengthOption?: number;
  theEnum?: any;
}): { minLength: number; maxLength: number } => {
  const isLengthDefined = lengthOption || lengthOption === 0;
  const isMinLengthDefined = minLengthOption || minLengthOption === 0;
  const isMaxLengthDefined = maxLengthOption || maxLengthOption === 0;

  if (isLengthDefined) {
    if (isMinLengthDefined) {
      throw new Error(`You cannot specify both minLength and length for ${parameterName}.`);
    }

    if (isMaxLengthDefined) {
      throw new Error(`You cannot specify both maxLength and length for ${parameterName}.`);
    }

    return {
      minLength: lengthOption,
      maxLength: lengthOption,
    };
  }

  if ((!isMinLengthDefined || !isMaxLengthDefined) && !theEnum) {
    throw new Error(`You must specify either length, enum, or minLength and maxLength for ${parameterName}.`);
  }

  return {
    minLength: minLengthOption,
    maxLength: maxLengthOption,
  };
};
