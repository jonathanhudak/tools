import type { IndexComponent, SearchComponents } from '@hex/application';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseFigmaInput } from '../shared/parse-figma-input.js';

export interface HttpHandlerDeps {
  readonly indexComponent: IndexComponent;
  readonly searchComponents: SearchComponents;
}

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

/**
 * Lambda Function URL / HTTP API handler.
 *   GET  /search?q=button&limit=5
 *   POST /components   { fileKey, node }
 */
export const makeHttpHandler =
  ({ indexComponent, searchComponents }: HttpHandlerDeps) =>
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    if (method === 'GET' && path === '/search') {
      const q = event.queryStringParameters?.['q'] ?? '';
      const limit = Number(event.queryStringParameters?.['limit'] ?? '10');
      const results = await searchComponents.execute({ query: q, limit: Number.isFinite(limit) ? limit : 10 });
      return json(200, { results });
    }

    if (method === 'POST' && path === '/components') {
      const input = parseFigmaInput(event.body);
      if (!input) return json(400, { error: 'Body must be {"fileKey": string, "node": FigmaNode}.' });
      const result = await indexComponent.execute(input);
      return result.ok ? json(201, result.value) : json(422, { error: result.error });
    }

    return json(404, { error: `No route for ${method} ${path}` });
  };
