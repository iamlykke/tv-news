import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { createSlide, listScreenSlides } from '@/lib/dal/slides';
import { getCelebrations } from '@/lib/dal/celebrations';
import { findScreenBySlug } from '@/lib/dal/screens';
import { todayIn } from '@/lib/dates';

type Ctx = { params: Promise<{ slug: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    const slides = await listScreenSlides(slug);
    const screen = await findScreenBySlug(slug);
    const celebrations = await getCelebrations(todayIn(screen.timezone), screen.id);
    return NextResponse.json({ screen, slides, ...celebrations });
});

export const POST = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    return NextResponse.json(await createSlide(slug, await readJson(req)), { status: 201 });
});
