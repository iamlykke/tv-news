import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/wrappers/api';
import { findScreenBySlug } from '@/lib/dal/screens';
import { listLiveSlides } from '@/lib/dal/slides';
import { findCelebrations } from '@/lib/dal/celebrations';
import { todayIn } from '@/lib/dates';

export const dynamic = 'force-dynamic';

/** Публичный эндпоинт для телевизора: всё, что сейчас нужно показать на экране. */
export const GET = apiHandler(async (_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const screen = await findScreenBySlug(slug);
    const [slides, celebrations] = await Promise.all([
        listLiveSlides(screen.id),
        findCelebrations(todayIn(screen.timezone), screen.id),
    ]);

    return NextResponse.json(
        { screen: { slug: screen.slug, name: screen.name }, slides, ...celebrations },
        { headers: { 'Cache-Control': 'no-store' } },
    );
});
