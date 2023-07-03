import { FieldEqualsListItemFilter } from './field-equals.list-item-filter';

describe('FieldEqualsListItemFilter', () => {
  describe('getFilterString', () => {
    it('returns a reference to the field, the eq operator, and the target value in quotes (separated by spaces and in that order)', () => {
      const fieldName = 'TheFieldName';
      const targetValue = 'the target value';
      const filter = new FieldEqualsListItemFilter({ fieldName, targetValue });

      expect(filter.getFilterString()).toBe(`fields/TheFieldName eq 'the target value'`);
    });
  });
});
