// TODO APIM-136: Commonise the interface with other code in the codebase
export interface ListItem<FieldNames extends string> {
  fields: Record<FieldNames, string>;
}
