import { FieldNotNullListItemFilter as FieldNotNullListItemFilter } from './field-not-null.list-item-filter';

describe('FieldNotNullListItemFilter', () => {
  describe('getFilterString', () => {
    it('returns a reference to the field, the neq operator, and the null value (separated by spaces and in that order)', () => {
      const fieldName = 'TheFieldName';
      const filter = new FieldNotNullListItemFilter({ fieldName });

      expect(filter.getFilterString()).toBe(`fields/TheFieldName neq null`);
    });
  });
});
