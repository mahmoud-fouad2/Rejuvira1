import { proxyFaheemlyRequest } from '@/lib/faheemly-proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const { path } = await props.params;
  return proxyFaheemlyRequest(request, '/api/visitor/' + (path || []).join('/'));
}

export async function POST(
  request: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const { path } = await props.params;
  return proxyFaheemlyRequest(request, '/api/visitor/' + (path || []).join('/'));
}

export async function OPTIONS(request: Request) {
  return proxyFaheemlyRequest(request, '/api/visitor');
}
