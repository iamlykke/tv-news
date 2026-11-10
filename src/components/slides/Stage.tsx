'use client';

import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Слайды верстаются на фиксированном холсте 1920×1080 и масштабируются под контейнер:
 * на ТВ — во весь экран, в админке — в превью-карточку.
 */
export default function Stage({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`relative overflow-hidden bg-black flex items-center justify-center ${className}`}>
            {scale > 0 && (
                <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
