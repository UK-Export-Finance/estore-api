// TODO apim-472: tests update the below

// import { GraphService } from '@ukef/modules/graph/graph.service';
// import { MdmService } from '@ukef/modules/mdm/mdm.service';
// import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
// import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
// import { resetAllWhenMocks, when } from 'jest-when';

// import { SiteNotFoundException } from './exception/site-not-found.exception';
// import { SiteService } from './site.service';

// jest.mock('@ukef/modules/graph/graph.service');

// describe('SiteService', () => {
//   const valueGenerator = new RandomValueGenerator();

//   const tfisSharepointUrl = valueGenerator.word();
//   const tfisCaseSitesListId = valueGenerator.word();

//   let siteService: SiteService;
//   let graphServiceGetRequest: jest.Mock;

//   beforeEach(() => {
//     graphServiceGetRequest = jest.fn();
//     const graphService = new GraphService(null);
//     graphService.get = graphServiceGetRequest;
//     siteService = new SiteService({ tfisSharepointUrl, tfisCaseSitesListId }, graphService, null);
//     resetAllWhenMocks();

//     const mdmService = new MdmService(null);
//     siteService = new SiteService({ tfisSharepointUrl, tfisCaseSitesListId }, graphService, mdmService);
//   });

//   describe('getSiteStatusByExporterName', () => {
//     const {
//       siteServiceGetSiteStatusByExporterNameRequest,
//       siteStatusByExporterNameResponse,
//       graphServiceGetParams,
//       graphServiceGetSiteStatusByExporterNameResponseDto,
//     } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, tfisSharepointUrl, tfisCaseSitesListId });

//     it('returns the site id and status from the service', async () => {
//       when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce(graphServiceGetSiteStatusByExporterNameResponseDto);

//       const response = await siteService.getSiteStatusByExporterName(siteServiceGetSiteStatusByExporterNameRequest);

//       expect(response).toEqual(siteStatusByExporterNameResponse);
//     });

//     it('throws a SiteNotFoundException if the site does not exist', async () => {
//       when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce({ value: [] });

//       await expect(siteService.getSiteStatusByExporterName(siteServiceGetSiteStatusByExporterNameRequest)).rejects.toThrow(
//         new SiteNotFoundException(`Site not found for exporter name: ${siteServiceGetSiteStatusByExporterNameRequest}`),
//       );
//     });
//   });
// });
