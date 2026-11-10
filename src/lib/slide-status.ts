import type { TSlideStatus } from '@/types';

type SlideLike = {
    isDeleted: boolean;
    isHidden: boolean;
    showAfter: Date | string | null;
    deleteAfter: Date | string | null;
};

export function getSlideStatus(slide: SlideLike, now: Date = new Date()): TSlideStatus {
    if (slide.isDeleted) return 'deleted';
    if (slide.deleteAfter && new Date(slide.deleteAfter) <= now) return 'expired';
    if (slide.isHidden) return 'hidden';
    if (slide.showAfter && new Date(slide.showAfter) > now) return 'scheduled';
    return 'live';
}

export function isVideoPath(path: string) {
    return /\.(mp4|webm|mov)$/i.test(path);
}
