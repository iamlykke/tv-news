import Link from 'next/link';
import { FaClock, FaEdit, FaTrashAlt } from 'react-icons/fa';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/api-client';
import type { TSlide } from '@/types';

export default function SlidePreview({ slide, editable }: { slide: TSlide; editable: boolean }) {
    const hasSchedule = slide.showAfter || slide.deleteAfter;

    return (
        <div className="group rounded-xl overflow-hidden border border-base-300 bg-base-100">
            <div className="relative bg-black">
                {slide.isVideo ? (
                    <video
                        src={slide.url}
                        className="w-full object-cover aspect-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                    />
                ) : (
                    <img src={slide.url} alt="Slide" className="w-full object-cover aspect-video" />
                )}
                <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={slide.status} />
                </div>

                {editable && (
                    <Link
                        href={`/admin/${slide.screen.slug}/slide/${slide.id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200"
                    >
                        <span className="btn btn-sm btn-neutral gap-2 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                            <FaEdit className="text-xs" />
                            Edit
                        </span>
                    </Link>
                )}
            </div>

            {hasSchedule && (
                <div className="px-3 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs border-t border-base-300">
                    {slide.showAfter && (
                        <span
                            className="inline-flex items-center gap-1.5 text-success"
                            title="Goes on screen after this date"
                        >
                            <FaClock className="text-[10px]" />
                            Showing from {formatDateTime(slide.showAfter)}
                        </span>
                    )}
                    {slide.deleteAfter && (
                        <span
                            className="inline-flex items-center gap-1.5 text-error"
                            title="Comes off screen after this date"
                        >
                            <FaTrashAlt className="text-[10px]" />
                            Ends {formatDateTime(slide.deleteAfter)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
