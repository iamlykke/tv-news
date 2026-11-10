import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { createUser, listUsers } from '@/lib/dal/users';

export const GET = apiHandler(async () => NextResponse.json(await listUsers()));

export const POST = apiHandler(async (req: NextRequest) =>
    NextResponse.json(await createUser(await readJson(req)), { status: 201 }),
);
