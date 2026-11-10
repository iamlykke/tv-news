'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { api, errorMessage, formatDateTime } from '@/lib/api-client';
import type { TSlide } from '@/types';

const PAGE_SIZE = 20;

export default function AllSlidesPage() {
    const [slides, setSlides] = useState<TSlide[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [screenFilter, setScreenFilter] = useState('');

    useEffect(() => {
        api<TSlide[]>('/api/admin/slides')
            .then(setSlides)
            .catch(e => setError(errorMessage(e)));
    }, []);

    const screens = useMemo(
        () => [...new Map((slides ?? []).map(s => [s.screen.slug, s.screen.name])).entries()],
        [slides],
    );
    const filtered = (slides ?? []).filter(s => !screenFilter || s.screen.slug === screenFilter);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const pageSlides = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold">All slides</h1>
                <select
                    className="select select-sm w-48"
                    value={screenFilter}
                    onChange={e => {
                        setScreenFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All screens</option>
                    {screens.map(([slug, name]) => (
                        <option key={slug} value={slug}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {!slides && !error ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Preview</th>
                                <th>Screen</th>
                                <th>Created</th>
                                <th>Show from</th>
                                <th>Take down after</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageSlides.map(slide => (
                                <tr key={slide.id} className="hover">
                                    <td>{slide.id}</td>
                                    <td>
                                        <Link href={`/admin/${slide.screen.slug}/slide/${slide.id}`}>
                                            {slide.isVideo ? (
                                                <video
                                                    src={slide.url}
                                                    className="w-36 aspect-video object-cover rounded bg-black"
                                                    muted
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <img
                                                    src={slide.url}
                                                    alt=""
                                                    className="w-36 aspect-video object-cover rounded bg-black"
                                                    loading="lazy"
                                                />
                                            )}
                                        </Link>
                                    </td>
                                    <td>{slide.screen.name}</td>
                                    <td>{formatDateTime(slide.createdAt)}</td>
                                    <td>{slide.showAfter ? formatDateTime(slide.showAfter) : '—'}</td>
                                    <td>{slide.deleteAfter ? formatDateTime(slide.deleteAfter) : '—'}</td>
                                    <td>
                                        <StatusBadge status={slide.status} />
                                    </td>
                                </tr>
                            ))}
                            {pageSlides.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-base-content/50">
                                        No slides uploaded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">
                        Page {current} of {totalPages} · {filtered.length} total
                    </span>
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            disabled={current === 1}
                            onClick={() => setPage(current - 1)}
                        >
                            ‹
                        </button>
                        <button className="join-item btn btn-sm btn-active">{current}</button>
                        <button
                            className="join-item btn btn-sm"
                            disabled={current === totalPages}
                            onClick={() => setPage(current + 1)}
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
