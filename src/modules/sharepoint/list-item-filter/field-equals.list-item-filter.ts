import { ListItemFilter } from './list-item-filter.interface';

export class FieldEqualsListItemFilter implements ListItemFilter {
  private readonly filterString: string;

  constructor({ fieldName, targetValue }: { fieldName: string; targetValue: string }) {
    this.filterString = `fields/${fieldName} eq '${targetValue}'`;
  }

  getFilterString(): string {
    return this.filterString;
  }
}
