import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/wrappers/api';
import { getCelebrations } from '@/lib/dal/celebrations';
import { findScreenBySlug } from '@/lib/dal/screens';
import { parseIsoDay, todayIn } from '@/lib/dates';
import { ValidationError } from '@/lib/errors';

/** ?date=yyyy-MM-dd&screen=<slug> — без screen считаем по всем активным людям. */
export const GET = apiHandler(async (req: NextRequest) => {
    const dateParam = req.nextUrl.searchParams.get('date');
    const slug = req.nextUrl.searchParams.get('screen');

    const screen = slug ? await findScreenBySlug(slug) : null;
    const target = dateParam ? parseIsoDay(dateParam) : todayIn(screen?.timezone ?? 'UTC');
    if (!target) throw new ValidationError('date: expected yyyy-MM-dd');

    return NextResponse.json(await getCelebrations(target, screen?.id));
});
