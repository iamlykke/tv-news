'use client';

import { FaAward, FaBirthdayCake } from 'react-icons/fa';
import Stage from '@/components/slides/Stage';
import BirthdaySlide from '@/components/slides/BirthdaySlide';
import AnniversarySlide from '@/components/slides/AnniversarySlide';
import { pickBackground } from '@/components/slides/decor';
import type { TCelebrations } from '@/types';

/** Превью автоматических слайдов — в точности как они будут выглядеть на ТВ. */
export default function CelebrationPreviews({ birthdays, anniversaries }: TCelebrations) {
    return (
        <>
            {birthdays.length > 0 && (
                <section>
                    <div className="flex items-center gap-2.5 mb-4">
                        <FaBirthdayCake className="text-primary text-lg" />
                        <h2 className="text-xl font-semibold">Birthdays</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {birthdays.map((person, i) => (
                            <Stage
                                key={person.personId}
                                className="w-full aspect-video rounded-xl border border-base-300"
                            >
                                <BirthdaySlide person={person} background={pickBackground(i)} />
                            </Stage>
                        ))}
                    </div>
                </section>
            )}

            {anniversaries.length > 0 && (
                <section>
                    <div className="flex items-center gap-2.5 mb-4">
                        <FaAward className="text-secondary text-lg" />
                        <h2 className="text-xl font-semibold">Anniversaries</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {anniversaries.map((item, i) => (
                            <Stage
                                key={item.personId}
                                className="w-full aspect-video rounded-xl border border-base-300"
                            >
                                <AnniversarySlide anniversary={item} background={pickBackground(i + 2)} />
                            </Stage>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
