'use client';

import { useEffect, useState } from 'react';
import SlidePreview from '@/components/SlidePreview';
import CelebrationPreviews from '@/components/CelebrationPreviews';
import { api, errorMessage } from '@/lib/api-client';
import type { TAnniversary, TBirthday, TSlide } from '@/types';

type Data = { slides: TSlide[]; birthdays: TBirthday[]; anniversaries: TAnniversary[] };

export default function SlideList({ slug }: { slug: string }) {
    const [data, setData] = useState<Data | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setData(null);
        api<Data>(`/api/admin/screen/${slug}/slides`)
            .then(setData)
            .catch(e => setError(errorMessage(e)));
    }, [slug]);

    if (error) return <div className="alert alert-error">{error}</div>;

    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-base-300 rounded-xl aspect-video" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {data.slides.length === 0 ? (
                <div className="text-center py-16 text-base-content/50">
                    <p className="text-lg">Нет слайдов</p>
                    <p className="text-sm mt-1">Добавьте первый слайд кнопкой выше</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {data.slides.map(slide => (
                        <SlidePreview key={slide.id} slide={slide} editable />
                    ))}
                </div>
            )}

            <CelebrationPreviews birthdays={data.birthdays} anniversaries={data.anniversaries} />
        </div>
    );
}
