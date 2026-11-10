import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Первый рубеж: без валидной сессии не пускаем в /admin и /api/admin.
 * Окончательная проверка (есть ли пользователь в БД, роль) — в DAL на каждом запросе.
 */
export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token && !token.invalid) return NextResponse.next();

    if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Пользователь не авторизован' }, { status: 401 });
    }

    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
