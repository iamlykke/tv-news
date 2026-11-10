type Props = {
    url: string;
    isVideo: boolean;
    /** на ТВ видео грузим целиком, в превью — только метаданные */
    preload?: 'auto' | 'metadata';
};

/** Загруженный слайд: картинка или mp4 во весь экран. */
export default function MediaSlide({ url, isVideo, preload = 'auto' }: Props) {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {isVideo ? (
                <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={preload}
                    className="w-full h-full object-cover"
                />
            ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
            )}
        </div>
    );
}
