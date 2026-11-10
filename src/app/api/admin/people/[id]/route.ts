import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseId, readJson } from '@/lib/wrappers/api';
import { deletePerson, updatePerson } from '@/lib/dal/people';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const id = parseId((await params).id);
    return NextResponse.json(await updatePerson(id, await readJson(req)));
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    await deletePerson(parseId((await params).id));
    return NextResponse.json({ success: true });
});
