import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

type Handler<C> = (req: NextRequest, ctx: C) => Promise<NextResponse | Response>;

/** Оборачивает route handler: AppError → JSON с нужным статусом, остальное → 500 + лог. */
export function apiHandler<C = any>(handler: Handler<C>) {
    return async (req: NextRequest, ctx: C): Promise<NextResponse | Response> => {
        try {
            return await handler(req, ctx);
        } catch (error) {
            if (error instanceof AppError) {
                if (error.statusCode >= 500) console.error(`[api] ${req.method} ${req.nextUrl.pathname}`, error);
                return NextResponse.json({ error: error.message }, { status: error.statusCode });
            }
            console.error(`[api] ${req.method} ${req.nextUrl.pathname}`, error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
    try {
        return (await req.json()) as T;
    } catch {
        throw new AppError('Invalid JSON', 400);
    }
}

export function parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new AppError('Invalid id', 400);
    return id;
}
