import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseId, readJson } from '@/lib/wrappers/api';
import { deleteUser, updateUserRole } from '@/lib/dal/users';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const id = parseId((await params).id);
    const { role } = await readJson<{ role?: unknown }>(req);
    return NextResponse.json(await updateUserRole(id, role));
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    await deleteUser(parseId((await params).id));
    return NextResponse.json({ success: true });
});
