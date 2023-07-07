import { ListItemFilter } from './list-item-filter.interface';

export class FieldNotNullListItemFilter implements ListItemFilter {
  private readonly filterString: string;

  constructor({ fieldName }: { fieldName: string }) {
    this.filterString = `fields/${fieldName} neq null`;
  }

  getFilterString(): string {
    return this.filterString;
  }
}
