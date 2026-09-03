import { proxyFaheemlyRequest } from '@/lib/faheemly-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyFaheemlyRequest(request, '/api/geo');
}

export async function OPTIONS(request: Request) {
  return proxyFaheemlyRequest(request, '/api/geo');
}
