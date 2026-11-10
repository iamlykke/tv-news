import type { TAnniversary } from '@/types';
import { ColorBars, Dot, halftone, initials, nameFontSize, PALETTE, Sparkle } from '@/components/slides/decor';

type Props = {
    anniversary: Pick<TAnniversary, 'fullName' | 'photoUrl' | 'years'>;
    background: string;
};

const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME?.trim();

export default function AnniversarySlide({ anniversary, background }: Props) {
    const { ink, paper } = PALETTE;
    const { years, fullName, photoUrl } = anniversary;
    const label = `${years === 1 ? 'year' : 'years'} with ${ORG_NAME || 'us'}`;

    return (
        <div className="absolute inset-0 flex font-display" style={{ color: ink }}>
            {/* фото слева */}
            <div
                className="relative h-full overflow-hidden flex items-center justify-center"
                style={{ width: 860, background: paper, borderRight: `16px solid ${ink}` }}
            >
                {photoUrl ? (
                    <img src={photoUrl} alt={fullName} className="absolute inset-0 w-full h-full object-cover object-top" />
                ) : (
                    <span style={{ fontSize: 300, fontWeight: 900 }}>{initials(fullName)}</span>
                )}
            </div>

            {/* цифра и подпись справа */}
            <div className="relative flex-1 h-full" style={{ background, ...halftone }}>
                <Sparkle size={110} style={{ right: 90, top: 330 }} />
                <Sparkle size={54} color={paper} style={{ left: 90, top: 190 }} />
                <Sparkle size={70} style={{ left: 120, bottom: 190 }} />
                <Dot size={30} color={ink} style={{ right: 330, top: 120 }} />
                <Dot size={22} color={paper} style={{ right: 150, bottom: 260 }} />

                <div className="absolute flex flex-col items-center text-center" style={{ left: 80, right: 80, top: 90, bottom: 140 }}>
                    <p style={{ fontSize: nameFontSize(fullName, [84, 72, 60, 50]), fontWeight: 700, lineHeight: 1.05 }}>
                        {fullName}
                    </p>

                    <div className="flex-1 flex items-center justify-center">
                        <span
                            style={{
                                fontSize: years >= 10 ? 470 : 560,
                                fontWeight: 900,
                                lineHeight: 0.8,
                                color: paper,
                                WebkitTextStroke: `16px ${ink}`,
                                paintOrder: 'stroke fill',
                                textShadow: `22px 22px 0 ${ink}`,
                                letterSpacing: '-0.04em',
                            }}
                        >
                            {years}
                        </span>
                    </div>

                    <span
                        className="rounded-full font-text uppercase"
                        style={{
                            background: ink,
                            color: paper,
                            fontSize: 46,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            padding: '18px 48px',
                        }}
                    >
                        {label}
                    </span>
                </div>
            </div>

            <ColorBars />
        </div>
    );
}
