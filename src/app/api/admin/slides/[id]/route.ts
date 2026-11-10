import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, parseId, readJson } from '@/lib/wrappers/api';
import { getSlide, softDeleteSlide, updateSlide } from '@/lib/dal/slides';

type Ctx = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Ctx) =>
    NextResponse.json(await getSlide(parseId((await params).id))),
);

export const PATCH = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const id = parseId((await params).id);
    return NextResponse.json(await updateSlide(id, await readJson(req)));
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    await softDeleteSlide(parseId((await params).id));
    return NextResponse.json({ success: true });
});
