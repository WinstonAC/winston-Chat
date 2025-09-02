import { headers } from 'next/headers';
import { getSiteId } from '../../lib/siteConfig';

export async function GET() {
  const headersList = headers();
  const host = headersList.get('host') || 'unknown';
  const siteId = getSiteId(host);
  
  return Response.json({
    ok: true,
    host,
    siteId
  });
}
