import { CSSProperties } from 'react';

/** Палитра «телевизионных» полос — та же, что на иконке приложения. */
export const PALETTE = {
    ink: '#121212',
    paper: '#FFF7E8',
    sun: '#FFC531',
    tomato: '#F2452E',
    grass: '#3BB54A',
    sky: '#1E9BD7',
    berry: '#E0306F',
};

export const BARS = [PALETTE.tomato, PALETTE.grass, PALETTE.sky, PALETTE.berry, PALETTE.sun];

/** Фоны слайдов чередуются по дню и порядковому номеру, текст всегда тёмный. */
const BACKGROUNDS = [PALETTE.sun, PALETTE.sky, PALETTE.berry, PALETTE.grass, PALETTE.tomato];

export function pickBackground(offset = 0) {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
    return BACKGROUNDS[(dayOfYear + offset) % BACKGROUNDS.length];
}

export function Sparkle({ size, color = PALETTE.ink, style }: { size: number; color?: string; style?: CSSProperties }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="absolute" style={style} aria-hidden>
            <path d="M50 0C54 36 64 46 100 50C64 54 54 64 50 100C46 64 36 54 0 50C36 46 46 36 50 0Z" fill={color} />
        </svg>
    );
}

export function Dot({ size, color, style }: { size: number; color: string; style?: CSSProperties }) {
    return <span className="absolute rounded-full" style={{ width: size, height: size, background: color, ...style }} />;
}

/** Полоса цветных полос внизу слайда — как настроечная таблица на старом ТВ. */
export function ColorBars({ height = 40 }: { height?: number }) {
    return (
        <div className="absolute left-0 right-0 bottom-0 flex" style={{ height, borderTop: `8px solid ${PALETTE.ink}` }}>
            {BARS.map(color => (
                <div key={color} className="flex-1" style={{ background: color }} />
            ))}
        </div>
    );
}

/** Лёгкая точечная фактура поверх цветного фона. */
export const halftone: CSSProperties = {
    backgroundImage: 'radial-gradient(rgba(18,18,18,0.10) 2.5px, transparent 2.5px)',
    backgroundSize: '36px 36px',
};

export function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Чем длиннее имя, тем мельче шрифт — чтобы влезало в две строки. */
export function nameFontSize(name: string, sizes: [number, number, number, number]) {
    const len = name.length;
    if (len <= 14) return sizes[0];
    if (len <= 20) return sizes[1];
    if (len <= 28) return sizes[2];
    return sizes[3];
}
