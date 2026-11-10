import { NextRequest, NextResponse } from 'next/server';
import { apiHandler, readJson } from '@/lib/wrappers/api';
import { createSlide, listScreenSlides } from '@/lib/dal/slides';
import { getCelebrations } from '@/lib/dal/celebrations';
import { findScreenBySlug } from '@/lib/dal/screens';
import { getCurrentUser } from '@/lib/dal/auth';
import { todayIn } from '@/lib/dates';

type Ctx = { params: Promise<{ slug: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    // One round trip for auth + screen, one for slides + celebrations
    const [, screen] = await Promise.all([getCurrentUser(), findScreenBySlug(slug)]);
    const [slides, celebrations] = await Promise.all([
        listScreenSlides(screen.id),
        getCelebrations(todayIn(screen.timezone), screen.id),
    ]);
    return NextResponse.json({ screen, slides, ...celebrations });
});

export const POST = apiHandler(async (req: NextRequest, { params }: Ctx) => {
    const { slug } = await params;
    return NextResponse.json(await createSlide(slug, await readJson(req)), { status: 201 });
});
