import { FixedClock, InMemoryComponentRepo, InMemorySearchIndex } from '@hex/adapters-driven';
import { makeHttpHandler, makeSqsConsumer } from '@hex/adapters-driving';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, SQSEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { buildUseCases } from '../src/container.js';

const ports = () => ({
  repo: new InMemoryComponentRepo(),
  index: new InMemorySearchIndex(),
  clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')),
});

const req = (method: string, rawPath: string, extra: Partial<APIGatewayProxyEventV2> = {}) =>
  ({ rawPath, requestContext: { http: { method } }, ...extra }) as unknown as APIGatewayProxyEventV2;

const body = (res: unknown): unknown => JSON.parse((res as APIGatewayProxyStructuredResultV2).body ?? 'null');

describe('composition: driving adapters wired to use cases', () => {
  it('POST /components then GET /search', async () => {
    const handler = makeHttpHandler(buildUseCases(ports()));
    const node = { id: '3:4', name: 'Text Field', type: 'COMPONENT' };
    const created = await handler(req('POST', '/components', { body: JSON.stringify({ fileKey: 'AbCdEf1234567890', node }) }));
    expect((created as APIGatewayProxyStructuredResultV2).statusCode).toBe(201);

    const found = await handler(req('GET', '/search', { queryStringParameters: { q: 'field' } }));
    expect(body(found)).toMatchObject({ results: [{ doc: { slug: 'text-field' } }] });
  });

  it('rejects malformed and invalid input with 400/422', async () => {
    const handler = makeHttpHandler(buildUseCases(ports()));
    const bad = await handler(req('POST', '/components', { body: '{' }));
    const invalid = await handler(
      req('POST', '/components', { body: JSON.stringify({ fileKey: 'AbCdEf1234567890', node: { id: '1:1', name: 'F', type: 'FRAME' } }) }),
    );
    expect([bad, invalid].map((r) => (r as APIGatewayProxyStructuredResultV2).statusCode)).toEqual([400, 422]);
  });

  it('SQS consumer reports only transient failures for redelivery', async () => {
    const p = ports();
    const boom = { ...p, repo: { save: () => Promise.reject(new Error('s3 down')), get: p.repo.get.bind(p.repo) } };
    const logs: string[] = [];
    const consumer = makeSqsConsumer(buildUseCases(boom), (m) => logs.push(m));
    const record = (messageId: string, b: string) => ({ messageId, body: b });
    const res = await consumer({
      Records: [
        record('a', 'not json'),
        record('b', JSON.stringify({ fileKey: 'AbCdEf1234567890', node: { id: '1:1', name: 'Ok', type: 'COMPONENT' } })),
      ],
    } as unknown as SQSEvent);
    expect(res.batchItemFailures).toEqual([{ itemIdentifier: 'b' }]);
    expect(logs).toEqual(['dropping malformed message', 'transient failure']);
  });
});
