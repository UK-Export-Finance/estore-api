// import { RandomValueGenerator } from "@ukef-test/support/generator/random-value-generator";
// import { MockGraphClientService } from "@ukef-test/support/mocks/graph-client.service.mock";
// import { SharepointService } from "@ukef/modules/sharepoint/sharepoint.service";
// import { resetAllWhenMocks, when } from "jest-when";
// import graphService from "../graph.service";
// import GraphService from "../graph.service";

// export const withFindListItemsTests = ({graphClientService, siteUrl, listId, filterString, expandString}) => {
//   describe('findListItems', () => {
//     const valueGenerator = new RandomValueGenerator();

//     let graphService: GraphService;

//     beforeEach(() => {
//         graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId });

//         jest.resetAllMocks();
//         resetAllWhenMocks();
//       });

//     describe('findListItem', () => {
//       const fieldsToReturn = [valueGenerator.word(), valueGenerator.word(), valueGenerator.word()];
//       const listItemsToReturn = [
//         {
//           fields: {
//             [fieldsToReturn[0]]: valueGenerator.string(),
//             [fieldsToReturn[1]]: valueGenerator.string(),
//             [fieldsToReturn[2]]: valueGenerator.string(),
//           },
//         },
//         {
//           fields: {
//             [fieldsToReturn[0]]: valueGenerator.string(),
//             [fieldsToReturn[1]]: valueGenerator.string(),
//             [fieldsToReturn[2]]: valueGenerator.string(),
//           },
//         },
//         {
//           fields: {
//             [fieldsToReturn[0]]: valueGenerator.string(),
//             [fieldsToReturn[1]]: valueGenerator.string(),
//             [fieldsToReturn[2]]: valueGenerator.string(),
//           },
//         },
//       ];

//       it('returns the list items for the site matching the given filter using GraphService', async () => {
//         const filter = {
//           getFilterString: () => filterString,
//         };
//         graphService

//         when(graphServiceGet)
//           .calledWith({
//             path: `${siteUrl}/lists/${listId}/items`,
//             filter: filterString,
//             expand: expandString,
//           })
//           .mockResolvedValueOnce({
//             value: listItemsToReturn,
//           });

//         const listItems = await graphService.findListItems({
//           siteUrl,
//           listId,
//           fieldsToReturn,
//           filter,
//         });

//         expect(listItems).toBe(listItemsToReturn);
//       });
//     });
//   });
// };
