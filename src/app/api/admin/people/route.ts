import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { createPerson, listPeople } from '@/lib/dal/people';

export const GET = apiHandler(async () => NextResponse.json(await listPeople()));

export const POST = apiHandler(async (req: NextRequest) =>
    NextResponse.json(await createPerson(await readJson(req)), { status: 201 }),
);
