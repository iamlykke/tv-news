'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '@/components/Modal';
import { useNotify } from '@/providers/NotificationProvider';
import { api, errorMessage } from '@/lib/api-client';
import type { TScreen, TUser } from '@/types';

type FormValues = { name: string; slug: string; timezone: string };

const TIMEZONE_HINTS = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Belgrade',
    'Europe/Berlin',
    'UTC',
];

export default function ScreensPage() {
    const router = useRouter();
    const notify = useNotify();
    const [screens, setScreens] = useState<TScreen[] | null>(null);
    const [me, setMe] = useState<TUser | null>(null);
    const [editing, setEditing] = useState<TScreen | 'new' | null>(null);
    const [deleting, setDeleting] = useState<TScreen | null>(null);
    const [busy, setBusy] = useState(false);
    const { register, handleSubmit, reset } = useForm<FormValues>();
    const canEdit = me?.role === 'ROLE_FULL_ADMIN';

    const load = useCallback(async () => {
        try {
            setScreens(await api<TScreen[]>('/api/admin/screens'));
        } catch (e) {
            notify.error(errorMessage(e));
        }
    }, [notify]);

    useEffect(() => {
        load();
        api<TUser>('/api/admin/me')
            .then(setMe)
            .catch(() => {});
    }, [load]);

    const openForm = (screen: TScreen | 'new') => {
        reset(screen === 'new' ? { name: '', slug: '', timezone: 'UTC' } : screen);
        setEditing(screen);
    };

    const onSubmit = async (data: FormValues) => {
        setBusy(true);
        try {
            if (editing === 'new') await api('/api/admin/screens', { method: 'POST', json: data });
            else if (editing) await api(`/api/admin/screens/${editing.id}`, { method: 'PATCH', json: data });
            notify.success('Saved');
            setEditing(null);
            await load();
            router.refresh(); // refresh the screen list in the sidebar
        } catch (e) {
            notify.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const onDelete = async () => {
        if (!deleting) return;
        setBusy(true);
        try {
            await api(`/api/admin/screens/${deleting.id}`, { method: 'DELETE' });
            notify.success('Screen deleted');
            setDeleting(null);
            await load();
            router.refresh();
        } catch (e) {
            notify.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Screens</h1>
                    <p className="text-sm text-base-content/60">Open /tv/&lt;slug&gt; on the TV to show a screen</p>
                </div>
                {canEdit && (
                    <button className="btn btn-primary btn-sm gap-2" onClick={() => openForm('new')}>
                        <FaPlus className="text-xs" /> Add
                    </button>
                )}
            </div>

            {!screens ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Timezone</th>
                            <th>TV URL</th>
                            {canEdit && <th className="w-28"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {screens.map(screen => (
                            <tr key={screen.id}>
                                <td className="font-medium">{screen.name}</td>
                                <td>
                                    <code>{screen.slug}</code>
                                </td>
                                <td>{screen.timezone}</td>
                                <td>
                                    <a href={`/tv/${screen.slug}`} target="_blank" className="link">
                                        /tv/{screen.slug}
                                    </a>
                                </td>
                                {canEdit && (
                                    <td>
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                className="btn btn-ghost btn-sm btn-square"
                                                onClick={() => openForm(screen)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-square text-error"
                                                onClick={() => setDeleting(screen)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal
                id="screen-form"
                isOpen={editing !== null}
                title={editing === 'new' ? 'New screen' : 'Edit screen'}
                onConfirm={handleSubmit(onSubmit)}
                onClose={() => setEditing(null)}
                confirmText="Save"
                isLoading={busy}
            >
                <div className="flex flex-col gap-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Name</legend>
                        <input
                            {...register('name', { required: true })}
                            className="input w-full"
                            placeholder="Serbia"
                        />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Slug (part of the URL)</legend>
                        <input {...register('slug', { required: true })} className="input w-full" placeholder="rs" />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Timezone</legend>
                        <input {...register('timezone', { required: true })} className="input w-full" list="tz-hints" />
                        <datalist id="tz-hints">
                            {TIMEZONE_HINTS.map(tz => (
                                <option key={tz} value={tz} />
                            ))}
                        </datalist>
                        <p className="label">Used to decide what “today” is for birthdays and anniversaries</p>
                    </fieldset>
                </div>
            </Modal>

            <Modal
                id="screen-delete"
                isOpen={deleting !== null}
                title={`Delete screen “${deleting?.name}”?`}
                onConfirm={onDelete}
                onClose={() => setDeleting(null)}
                isLoading={busy}
            >
                All slides on this screen will be deleted. People assigned to it will move to “All screens”.
            </Modal>
        </div>
    );
}
