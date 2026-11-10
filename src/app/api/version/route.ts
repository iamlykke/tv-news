import { readFileSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getBuildId() {
    if (process.env.VERCEL_DEPLOYMENT_ID) return process.env.VERCEL_DEPLOYMENT_ID;
    try {
        return readFileSync(path.join(process.cwd(), '.next/BUILD_ID'), 'utf8').trim();
    } catch {
        return 'dev';
    }
}

/** Телевизоры раз в 10 минут сверяют buildId и перезагружаются после нового деплоя. */
export async function GET() {
    return Response.json({ buildId: getBuildId() }, { headers: { 'Cache-Control': 'no-store' } });
}
