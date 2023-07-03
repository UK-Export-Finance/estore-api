import { ListItemFilter } from './list-item-filter.interface';

export class AndListItemFilter {
  constructor(private readonly firstFilter: ListItemFilter, private readonly secondFilter: ListItemFilter) {}

  getFilterString(): string {
    return `${this.firstFilter.getFilterString()} and ${this.secondFilter.getFilterString()}`;
  }
}
