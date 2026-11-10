'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import SlideForm from '@/components/SlideForm';
import StatusBadge from '@/components/StatusBadge';
import { api, errorMessage } from '@/lib/api-client';
import type { TSlide } from '@/types';

export default function EditSlidePage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params);
    const [slide, setSlide] = useState<TSlide | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api<TSlide>(`/api/admin/slides/${id}`)
            .then(setSlide)
            .catch(e => setError(errorMessage(e)));
    }, [id]);

    return (
        <div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Slide #{id}</h1>
                    {slide && <StatusBadge status={slide.status} />}
                </div>
                <Link href={`/admin/${slug}`} className="btn btn-ghost btn-sm">
                    ← Back to slides
                </Link>
            </div>
            {error && <div className="alert alert-error mt-6">{error}</div>}
            {slide && <SlideForm slug={slide.screen.slug} slide={slide} onSaved={setSlide} />}
        </div>
    );
}
