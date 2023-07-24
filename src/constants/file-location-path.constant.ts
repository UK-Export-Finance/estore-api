export const FILE_LOCATION_PATH = {
  // [a-fA-F\d]{24} matches a MongoDB hex, which will be the name of the first folder in the path.
  REGEX: /^[a-fA-F\d]{24}(\/[\w\-:\\()\s]+)*$/,
};
