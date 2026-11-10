import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { createScreen, listScreens } from '@/lib/dal/screens';

export const GET = apiHandler(async () => NextResponse.json(await listScreens()));

export const POST = apiHandler(async (req: NextRequest) =>
    NextResponse.json(await createScreen(await readJson(req)), { status: 201 }),
);
