// TODO apim-472: remove these tests

// import { GraphService } from '@ukef/modules/graph/graph.service';
// import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
// import { when } from 'jest-when';

// import { SharepointService } from './sharepoint.service';

// jest.mock('@ukef/modules/graph/graph.service');

// describe('SharepointService', () => {
//   const valueGenerator = new RandomValueGenerator();

//   let graphServiceGet: jest.Mock;

//   let service: SharepointService;

//   beforeEach(() => {
//     graphServiceGet = jest.fn();
//     const graphService = new GraphService(null);
//     graphService.get = graphServiceGet;
//     service = new SharepointService(graphService);
//   });

//   describe('searchList', () => {
//     const siteUrl = 'sites/abc.sharepoint.com:/sites/my-site:';
//     const listId = valueGenerator.word();
//     const fieldsToReturn = [valueGenerator.word(), valueGenerator.word(), valueGenerator.word()];
//     const listItemsToReturn = [
//       {
//         fields: {
//           [fieldsToReturn[0]]: valueGenerator.string(),
//           [fieldsToReturn[1]]: valueGenerator.string(),
//           [fieldsToReturn[2]]: valueGenerator.string(),
//         },
//       },
//       {
//         fields: {
//           [fieldsToReturn[0]]: valueGenerator.string(),
//           [fieldsToReturn[1]]: valueGenerator.string(),
//           [fieldsToReturn[2]]: valueGenerator.string(),
//         },
//       },
//       {
//         fields: {
//           [fieldsToReturn[0]]: valueGenerator.string(),
//           [fieldsToReturn[1]]: valueGenerator.string(),
//           [fieldsToReturn[2]]: valueGenerator.string(),
//         },
//       },
//     ];

//     it('returns the list items for the site matching the given filter using GraphService', async () => {
//       const filterString = valueGenerator.string();
//       const filter = {
//         getFilterString: () => filterString,
//       };
//       when(graphServiceGet)
//         .calledWith({
//           path: `${siteUrl}/lists/${listId}/items`,
//           filter: filterString,
//           expand: `fields($select=${fieldsToReturn[0]},${fieldsToReturn[1]},${fieldsToReturn[2]})`,
//         })
//         .mockResolvedValueOnce({
//           value: listItemsToReturn,
//         });

//       const listItems = await service.findListItems({
//         siteUrl,
//         listId,
//         fieldsToReturn,
//         filter,
//       });

//       expect(listItems).toBe(listItemsToReturn);
//     });
//   });
// });
