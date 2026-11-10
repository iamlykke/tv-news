'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '@/components/Modal';
import { initials } from '@/components/slides/decor';
import { useNotify } from '@/providers/NotificationProvider';
import { api, errorMessage, formatDay } from '@/lib/api-client';
import { uploadFile } from '@/lib/upload-client';
import type { TPerson, TScreen } from '@/types';

type FormValues = {
    fullName: string;
    dateOfBirth: string;
    startDate: string;
    screenId: string;
    isActive: boolean;
    photo: FileList;
    removePhoto: boolean;
};

const EMPTY: Omit<FormValues, 'photo'> = {
    fullName: '',
    dateOfBirth: '',
    startDate: '',
    screenId: '',
    isActive: true,
    removePhoto: false,
};

function Avatar({ person }: { person: TPerson }) {
    return person.photoUrl ? (
        <img src={person.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover object-top" />
    ) : (
        <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center text-sm font-semibold">
            {initials(person.fullName)}
        </div>
    );
}

export default function PeoplePage() {
    const notify = useNotify();
    const [people, setPeople] = useState<TPerson[] | null>(null);
    const [screens, setScreens] = useState<TScreen[]>([]);
    const [editing, setEditing] = useState<TPerson | 'new' | null>(null);
    const [deleting, setDeleting] = useState<TPerson | null>(null);
    const [busy, setBusy] = useState(false);
    const [query, setQuery] = useState('');

    const { register, handleSubmit, reset, watch, formState } = useForm<FormValues>({ defaultValues: EMPTY });

    const load = useCallback(async () => {
        try {
            setPeople(await api<TPerson[]>('/api/admin/people'));
        } catch (e) {
            notify.error(errorMessage(e));
        }
    }, [notify]);

    useEffect(() => {
        load();
        api<TScreen[]>('/api/admin/screens').then(setScreens).catch(() => {});
    }, [load]);

    const openForm = (person: TPerson | 'new') => {
        reset(
            person === 'new'
                ? EMPTY
                : {
                      fullName: person.fullName,
                      dateOfBirth: person.dateOfBirth ?? '',
                      startDate: person.startDate ?? '',
                      screenId: person.screenId ? String(person.screenId) : '',
                      isActive: person.isActive,
                      removePhoto: false,
                  },
        );
        setEditing(person);
    };

    const onSubmit = async (data: FormValues) => {
        setBusy(true);
        try {
            const file = data.photo?.[0];
            let photoPath: string | null | undefined;
            if (file) photoPath = await uploadFile('person', file);
            else if (data.removePhoto) photoPath = null;

            const payload = {
                fullName: data.fullName,
                dateOfBirth: data.dateOfBirth || null,
                startDate: data.startDate || null,
                screenId: data.screenId ? Number(data.screenId) : null,
                isActive: data.isActive,
                ...(photoPath !== undefined ? { photoPath } : {}),
            };

            if (editing === 'new') {
                await api('/api/admin/people', { method: 'POST', json: payload });
                notify.success('Добавлено');
            } else if (editing) {
                await api(`/api/admin/people/${editing.id}`, { method: 'PATCH', json: payload });
                notify.success('Сохранено');
            }
            setEditing(null);
            await load();
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
            await api(`/api/admin/people/${deleting.id}`, { method: 'DELETE' });
            notify.success('Удалено');
            setDeleting(null);
            await load();
        } catch (e) {
            notify.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const filtered = (people ?? []).filter(p => p.fullName.toLowerCase().includes(query.trim().toLowerCase()));
    const currentPhoto = editing && editing !== 'new' ? editing.photoUrl : null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Люди</h1>
                    <p className="text-sm text-base-content/60">По этим данным собираются слайды дней рождения и годовщин</p>
                </div>
                <div className="flex gap-2">
                    <input
                        className="input input-sm w-56"
                        placeholder="Поиск по имени"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm gap-2" onClick={() => openForm('new')}>
                        <FaPlus className="text-xs" /> Добавить
                    </button>
                </div>
            </div>

            {!people ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Имя</th>
                                <th>День рождения</th>
                                <th>В команде с</th>
                                <th>Экран</th>
                                <th>Статус</th>
                                <th className="w-28"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(person => (
                                <tr key={person.id} className={person.isActive ? '' : 'opacity-50'}>
                                    <td>
                                        <Avatar person={person} />
                                    </td>
                                    <td className="font-medium">{person.fullName}</td>
                                    <td>{formatDay(person.dateOfBirth)}</td>
                                    <td>{formatDay(person.startDate)}</td>
                                    <td>{person.screen?.name ?? 'Все экраны'}</td>
                                    <td>
                                        <span className={`badge badge-sm ${person.isActive ? 'badge-success' : 'badge-ghost'}`}>
                                            {person.isActive ? 'Активен' : 'Не показывать'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1 justify-end">
                                            <button className="btn btn-ghost btn-sm btn-square" onClick={() => openForm(person)} title="Редактировать">
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-square text-error"
                                                onClick={() => setDeleting(person)}
                                                title="Удалить"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-base-content/50">
                                        {people.length === 0 ? 'Список пуст — добавьте первого человека' : 'Никого не нашлось'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                id="person-form"
                isOpen={editing !== null}
                title={editing === 'new' ? 'Новый человек' : 'Редактировать'}
                onConfirm={handleSubmit(onSubmit)}
                onClose={() => setEditing(null)}
                confirmText={editing === 'new' ? 'Добавить' : 'Сохранить'}
                isLoading={busy}
            >
                <div className="flex flex-col gap-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Имя и фамилия</legend>
                        <input
                            {...register('fullName', { required: 'Обязательное поле' })}
                            className={`input w-full ${formState.errors.fullName ? 'input-error' : ''}`}
                            placeholder="Jane Doe"
                        />
                        {formState.errors.fullName && <p className="text-error text-sm">{formState.errors.fullName.message}</p>}
                    </fieldset>

                    <div className="grid grid-cols-2 gap-3">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">День рождения</legend>
                            <input {...register('dateOfBirth')} type="date" className="input w-full" />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">В команде с</legend>
                            <input {...register('startDate')} type="date" className="input w-full" />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Экран</legend>
                        <select {...register('screenId')} className="select w-full">
                            <option value="">Все экраны</option>
                            {screens.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Фото</legend>
                        <div className="flex items-center gap-3">
                            {currentPhoto && !watch('removePhoto') && (
                                <img src={currentPhoto} alt="" className="w-12 h-12 rounded-full object-cover object-top" />
                            )}
                            <input {...register('photo')} type="file" accept="image/jpeg,image/png,image/webp" className="file-input flex-1" />
                        </div>
                        {currentPhoto && (
                            <label className="label cursor-pointer gap-2 mt-1">
                                <input {...register('removePhoto')} type="checkbox" className="checkbox checkbox-sm" />
                                Удалить текущее фото
                            </label>
                        )}
                        <p className="label">Квадратное, от 800×800. Без фото на слайде будут инициалы.</p>
                    </fieldset>

                    <label className="label cursor-pointer gap-3">
                        <input {...register('isActive')} type="checkbox" className="toggle toggle-success" />
                        Показывать на экранах
                    </label>
                </div>
            </Modal>

            <Modal
                id="person-delete"
                isOpen={deleting !== null}
                title="Удалить человека?"
                onConfirm={onDelete}
                onClose={() => setDeleting(null)}
                isLoading={busy}
            >
                {deleting?.fullName} пропадёт из списка вместе с фото. Чтобы просто перестать показывать — выключите
                «Показывать на экранах».
            </Modal>
        </div>
    );
}
