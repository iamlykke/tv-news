import type { TBirthday } from '@/types';
import { ColorBars, Dot, halftone, initials, nameFontSize, PALETTE, Sparkle } from '@/components/slides/decor';

type Props = {
    person: Pick<TBirthday, 'fullName' | 'photoUrl' | 'dateLabel'>;
    background: string;
};

export default function BirthdaySlide({ person, background }: Props) {
    const { ink, paper } = PALETTE;

    return (
        <div className="absolute inset-0 font-display" style={{ background, color: ink, ...halftone }}>
            {/* декор */}
            <Sparkle size={120} style={{ left: 90, top: 80 }} />
            <Sparkle size={56} color={paper} style={{ left: 760, top: 120 }} />
            <Sparkle size={90} style={{ right: 140, top: 110 }} />
            <Sparkle size={48} color={paper} style={{ right: 420, bottom: 170 }} />
            <Dot size={34} color={ink} style={{ left: 120, bottom: 210 }} />
            <Dot size={22} color={paper} style={{ left: 820, bottom: 260 }} />
            <Dot size={26} color={ink} style={{ right: 260, top: 300 }} />

            {/* фото-«наклейка» */}
            <div className="absolute" style={{ left: 170, top: 190, width: 620, height: 620 }}>
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: ink, transform: 'translate(26px, 26px)' }}
                />
                <div
                    className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ border: `16px solid ${ink}`, background: paper }}
                >
                    {person.photoUrl ? (
                        <img
                            src={person.photoUrl}
                            alt={person.fullName}
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <span style={{ fontSize: 240, fontWeight: 900 }}>{initials(person.fullName)}</span>
                    )}
                </div>
                <div
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                        right: -10,
                        bottom: 30,
                        width: 190,
                        height: 190,
                        background: paper,
                        border: `12px solid ${ink}`,
                        fontSize: 96,
                        transform: 'rotate(-12deg)',
                    }}
                >
                    🎂
                </div>
            </div>

            {/* текст */}
            <div
                className="absolute flex flex-col justify-center"
                style={{ left: 930, right: 110, top: 120, bottom: 160 }}
            >
                <span
                    className="self-start rounded-full font-text uppercase"
                    style={{
                        background: ink,
                        color: paper,
                        fontSize: 34,
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        padding: '14px 34px',
                    }}
                >
                    Today · {person.dateLabel}
                </span>

                <h1
                    className="uppercase"
                    style={{
                        fontSize: 132,
                        fontWeight: 900,
                        lineHeight: 0.92,
                        marginTop: 44,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Happy
                    <br />
                    Birthday
                </h1>

                <p
                    style={{
                        fontSize: nameFontSize(person.fullName, [104, 88, 72, 58]),
                        fontWeight: 700,
                        lineHeight: 1.05,
                        marginTop: 48,
                    }}
                >
                    {person.fullName}
                </p>
            </div>

            <ColorBars />
        </div>
    );
}
