'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Modal from '@/components/Modal';
import SlidePreview from '@/components/SlidePreview';
import { useNotify } from '@/providers/NotificationProvider';
import { api, errorMessage, isoToLocalInput, localInputToIso } from '@/lib/api-client';
import { uploadFile } from '@/lib/upload-client';
import type { TSlide } from '@/types';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm';
const ALLOWED = new Set(ACCEPT.split(','));

type FormValues = {
    file: FileList;
    showAfter: string;
    deleteAfter: string;
    isHidden: boolean;
};

type Props = { slug: string; slide?: TSlide; onSaved?: (slide: TSlide) => void };

/** Создание (slide не передан) и редактирование слайда. */
export default function SlideForm({ slug, slide, onSaved }: Props) {
    const router = useRouter();
    const notify = useNotify();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const isEdit = !!slide;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            showAfter: isoToLocalInput(slide?.showAfter),
            deleteAfter: isoToLocalInput(slide?.deleteAfter),
            isHidden: slide?.isHidden ?? false,
        },
    });

    useEffect(() => {
        reset({
            showAfter: isoToLocalInput(slide?.showAfter),
            deleteAfter: isoToLocalInput(slide?.deleteAfter),
            isHidden: slide?.isHidden ?? false,
        });
    }, [slide, reset]);

    const files = watch('file');
    const localPreview = useMemo(() => {
        const file = files?.[0];
        return file ? { url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') } : null;
    }, [files]);
    useEffect(() => () => (localPreview ? URL.revokeObjectURL(localPreview.url) : undefined), [localPreview]);

    const onSubmit = async (data: FormValues) => {
        setSaving(true);
        try {
            const file = data.file?.[0];
            const storagePath = file ? await uploadFile('slide', file) : undefined;
            const payload = {
                storagePath,
                showAfter: localInputToIso(data.showAfter),
                deleteAfter: localInputToIso(data.deleteAfter),
                isHidden: data.isHidden,
            };

            if (isEdit) {
                const updated = await api<TSlide>(`/api/admin/slides/${slide.id}`, { method: 'PATCH', json: payload });
                notify.success('Slide updated');
                setValue('file', undefined as unknown as FileList);
                onSaved?.(updated);
            } else {
                await api(`/api/admin/screen/${slug}/slides`, { method: 'POST', json: payload });
                notify.success('Slide added');
                router.push(`/admin/${slug}`);
                router.refresh();
            }
        } catch (e) {
            notify.error(errorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!slide) return;
        setDeleting(true);
        try {
            await api(`/api/admin/slides/${slide.id}`, { method: 'DELETE' });
            notify.success('Slide deleted');
            router.push(`/admin/${slug}`);
        } catch (e) {
            notify.error(errorMessage(e));
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8 mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 max-w-lg space-y-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{isEdit ? 'Replace file' : 'Slide file'}</legend>
                    <input
                        {...register('file', {
                            validate: list => {
                                const file = list?.[0];
                                if (!file) return isEdit || 'Choose a file';
                                return ALLOWED.has(file.type) || 'Allowed: JPG, PNG, WebP, AVIF, MP4 or WebM';
                            },
                        })}
                        type="file"
                        accept={ACCEPT}
                        className={`file-input w-full ${errors.file ? 'file-input-error' : ''}`}
                    />
                    <p className="label">Best at 1920×1080. Videos play muted, on loop.</p>
                    {errors.file && <p className="text-error text-sm">{errors.file.message}</p>}
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Show from</legend>
                    <div className="join w-full">
                        <input {...register('showAfter')} type="datetime-local" className="input join-item flex-1" />
                        <button type="button" className="btn join-item" onClick={() => setValue('showAfter', '')}>
                            ✕
                        </button>
                    </div>
                    <p className="label">Empty — right away</p>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Take down after</legend>
                    <div className="join w-full">
                        <input {...register('deleteAfter')} type="datetime-local" className="input join-item flex-1" />
                        <button type="button" className="btn join-item" onClick={() => setValue('deleteAfter', '')}>
                            ✕
                        </button>
                    </div>
                    <p className="label">Empty — no end date</p>
                </fieldset>

                <label className="label cursor-pointer gap-3">
                    <input {...register('isHidden')} type="checkbox" className="toggle toggle-warning" />
                    Hide slide
                </label>

                <div className="divider my-2" />

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                        {saving && <span className="loading loading-spinner loading-sm" />}
                        {isEdit ? 'Save' : 'Add'}
                    </button>
                    {isEdit && !slide.isDeleted && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="btn btn-outline btn-error flex-1"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </form>

            <div className="flex-1">
                {localPreview ? (
                    <div className="rounded-xl overflow-hidden border border-base-300 bg-black">
                        {localPreview.isVideo ? (
                            <video
                                src={localPreview.url}
                                className="w-full aspect-video object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img src={localPreview.url} alt="" className="w-full aspect-video object-cover" />
                        )}
                    </div>
                ) : slide ? (
                    <SlidePreview slide={slide} editable={false} />
                ) : (
                    <div className="rounded-xl border border-dashed border-base-300 aspect-video flex items-center justify-center text-base-content/40">
                        Preview appears after you pick a file
                    </div>
                )}
            </div>

            <Modal
                id="confirm-delete-slide"
                isOpen={confirmDelete}
                title="Delete slide?"
                onConfirm={onDelete}
                onClose={() => setConfirmDelete(false)}
                isLoading={deleting}
            >
                The slide will disappear from the screen but stay in the “All slides” history.
            </Modal>
        </div>
    );
}
