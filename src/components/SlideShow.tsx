'use client';

import { useCallback, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import Stage from '@/components/slides/Stage';
import MediaSlide from '@/components/slides/MediaSlide';
import BirthdaySlide from '@/components/slides/BirthdaySlide';
import AnniversarySlide from '@/components/slides/AnniversarySlide';
import { pickBackground } from '@/components/slides/decor';
import type { TAnniversary, TBirthday, TSlide } from '@/types';

type Props = {
    slides: TSlide[];
    birthdays: TBirthday[];
    anniversaries: TAnniversary[];
    loading: boolean;
    error: string | null;
    onNearEnd: () => void;
};

const SLIDE_DURATION_MS = 15_000;

function FullscreenMessage({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen bg-black text-white/70 flex items-center justify-center font-display text-2xl">
            {children}
        </div>
    );
}

export function SlideShow({ slides, birthdays, anniversaries, loading, error, onNearEnd }: Props) {
    const sliderRef = useRef<Slider | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const total = slides.length + birthdays.length + anniversaries.length;

    // Играет только видео на текущем слайде, остальные стоят на паузе
    const syncActiveVideo = useCallback((restart: boolean) => {
        wrapRef.current?.querySelectorAll<HTMLVideoElement>('video').forEach(video => {
            const isActive = video.closest('.slick-current') !== null;
            if (isActive) {
                if (restart) video.currentTime = 0;
                if (restart || video.paused) void video.play().catch(() => {});
            } else if (!video.paused) {
                video.pause();
            }
        });
    }, []);

    const settings = {
        arrows: false,
        dots: false,
        autoplay: true,
        autoplaySpeed: SLIDE_DURATION_MS,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: false,
        speed: 500,
        pauseOnHover: false,
        pauseOnFocus: false,
        cssEase: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        useTransform: false,
        // На предпоследнем шаге перезапрашиваем данные, чтобы новые слайды успели подгрузиться
        beforeChange: (_current: number, next: number) => {
            if (next === total - 1) onNearEnd();
            wrapRef.current?.querySelectorAll<HTMLVideoElement>('video').forEach(video => {
                if (!video.closest('.slick-current')) video.currentTime = 0;
            });
        },
        afterChange: () => syncActiveVideo(true),
    };

    // Стрелки на клавиатуре/пульте листают слайды
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') sliderRef.current?.slickNext();
            if (e.key === 'ArrowLeft') sliderRef.current?.slickPrev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Некоторые ТВ-браузеры не стартуют autoplay сразу — несколько раз пробуем запустить текущее видео
    useEffect(() => {
        let tries = 0;
        const id = window.setInterval(() => {
            syncActiveVideo(false);
            tries += 1;
            const current = wrapRef.current?.querySelector<HTMLVideoElement>('.slick-current video');
            if (!current || !current.paused || tries >= 6) window.clearInterval(id);
        }, 400);
        return () => window.clearInterval(id);
    }, [slides, birthdays, anniversaries, syncActiveVideo]);

    if (loading) return <FullscreenMessage>Loading…</FullscreenMessage>;
    if (total === 0) return <FullscreenMessage>{error ?? 'No slides yet'}</FullscreenMessage>;

    return (
        <div ref={wrapRef} className="w-screen h-screen overflow-hidden bg-black">
            <Slider ref={sliderRef} {...settings}>
                {slides.map(slide => (
                    <div key={`slide-${slide.id}`} className="w-screen h-screen">
                        <MediaSlide url={slide.url} isVideo={slide.isVideo} />
                    </div>
                ))}
                {birthdays.map((person, i) => (
                    <div key={`bday-${person.personId}`}>
                        <Stage className="w-screen h-screen">
                            <BirthdaySlide person={person} background={pickBackground(i)} />
                        </Stage>
                    </div>
                ))}
                {anniversaries.map((item, i) => (
                    <div key={`anniv-${item.personId}`}>
                        <Stage className="w-screen h-screen">
                            <AnniversarySlide anniversary={item} background={pickBackground(i + 2)} />
                        </Stage>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
