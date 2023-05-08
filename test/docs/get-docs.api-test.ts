import { Api } from '@ukef-test/support/api';

describe('GET /openapi/yaml', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  it('returns a 200 OK response', async () => {
    const { status } = await api.get('/openapi/yaml');
    expect(status).toBe(200);
  });

  it('matches the snapshot', async () => {
    const { text } = await api.get('/openapi/yaml');
    expect(text).toMatchSnapshot();
  });
});

describe('GET /openapi/json', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  it('returns a 200 OK response', async () => {
    const { status } = await api.get('/openapi/json');
    expect(status).toBe(200);
  });

  it('matches the snapshot', async () => {
    const { text } = await api.get('/openapi/json');
    expect(text).toMatchSnapshot();
  });
});
