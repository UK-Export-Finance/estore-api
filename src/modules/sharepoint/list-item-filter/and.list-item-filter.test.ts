import { AndListItemFilter } from './and.list-item-filter';

describe('AndListItemFilter', () => {
  describe('getFilterString', () => {
    it('returns the first filter string, the and operator, and the second filter string (separated by spaces and in that order)', () => {
      const firstFilterString = 'first filter string';
      const firstFilter = { getFilterString: () => firstFilterString };
      const secondFilterString = 'second filter string';
      const secondFilter = { getFilterString: () => secondFilterString };

      const filter = new AndListItemFilter(firstFilter, secondFilter);

      expect(filter.getFilterString()).toBe('first filter string and second filter string');
    });
  });
});
