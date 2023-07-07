export interface ListItem<FieldNames extends string> {
  fields: Record<FieldNames, string>;
}
