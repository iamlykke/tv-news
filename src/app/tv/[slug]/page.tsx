'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import { SlideShow } from '@/components/SlideShow';
import type { TAnniversary, TBirthday, TSlide } from '@/types';

type TvData = { slides: TSlide[]; birthdays: TBirthday[]; anniversaries: TAnniversary[] };

/** Даже если показывать нечего (и слайдер не крутится), периодически проверяем, не появилось ли что-то. */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function TvScreenPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [data, setData] = useState<TvData>({ slides: [], birthdays: [], anniversaries: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [missing, setMissing] = useState(false);
    const lastJson = useRef('');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/tv/${slug}`, { cache: 'no-store' });
            if (res.status === 404) return setMissing(true);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const next: TvData = { slides: json.slides, birthdays: json.birthdays, anniversaries: json.anniversaries };
            const serialized = JSON.stringify(next);
            // Не трогаем слайдер, если ничего не поменялось — иначе он перескочит на первый слайд
            if (serialized !== lastJson.current) {
                lastJson.current = serialized;
                setData(next);
            }
            setError(null);
        } catch (e) {
            // Сеть моргнула — продолжаем крутить то, что уже есть
            console.error('[tv] fetch failed', e);
            setError('Connection problem, retrying…');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchData();
        const id = window.setInterval(fetchData, POLL_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [fetchData]);

    if (missing) notFound();

    return <SlideShow {...data} loading={loading} error={error} onNearEnd={fetchData} />;
}
