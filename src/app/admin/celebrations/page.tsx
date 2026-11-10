'use client';

import { useEffect, useState } from 'react';
import CelebrationPreviews from '@/components/CelebrationPreviews';
import { api, errorMessage, todayLocalIsoDay } from '@/lib/api-client';
import type { TCelebrations, TScreen } from '@/types';

/** Проверка: какие слайды ДР и годовщин будут на экране в выбранный день. */
export default function CelebrationsPage() {
    const [date, setDate] = useState(todayLocalIsoDay);
    const [screen, setScreen] = useState('');
    const [screens, setScreens] = useState<TScreen[]>([]);
    const [data, setData] = useState<TCelebrations | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api<TScreen[]>('/api/admin/screens')
            .then(setScreens)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!date) return;
        const params = new URLSearchParams({ date });
        if (screen) params.set('screen', screen);
        const timeout = setTimeout(() => {
            setData(null);
            api<TCelebrations>(`/api/admin/celebrations?${params}`)
                .then(d => {
                    setData(d);
                    setError(null);
                })
                .catch(e => setError(errorMessage(e)));
        }, 300);
        return () => clearTimeout(timeout);
    }, [date, screen]);

    const empty = data && data.birthdays.length === 0 && data.anniversaries.length === 0;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold">Celebrations</h1>
                <div className="flex items-center gap-2">
                    <select
                        className="select select-sm w-44 shrink-0"
                        value={screen}
                        onChange={e => setScreen(e.target.value)}
                    >
                        <option value="">All screens</option>
                        {screens.map(s => (
                            <option key={s.id} value={s.slug}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="input input-sm w-40 shrink-0"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                    <button className="btn btn-sm" onClick={() => setDate(todayLocalIsoDay())}>
                        Today
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {!data && !error && (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            )}
            {empty && <p className="text-center py-16 text-base-content/50">Nothing to celebrate on this day</p>}
            {data && <CelebrationPreviews birthdays={data.birthdays} anniversaries={data.anniversaries} />}
        </div>
    );
}
