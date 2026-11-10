import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseId, readJson } from '@/lib/wrappers/api';
import { deleteScreen, updateScreen } from '@/lib/dal/screens';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const id = parseId((await params).id);
    return NextResponse.json(await updateScreen(id, await readJson(req)));
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    await deleteScreen(parseId((await params).id));
    return NextResponse.json({ success: true });
});
