'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Modal from '@/components/Modal';
import { useNotify } from '@/providers/NotificationProvider';
import { api, errorMessage } from '@/lib/api-client';
import type { TUser, TUserRole } from '@/types';

type FormValues = { email: string; role: TUserRole };

const ROLE_LABELS: Record<TUserRole, string> = {
    ROLE_ADMIN: 'Admin — slides and people',
    ROLE_FULL_ADMIN: 'Full Admin — also screens and admins',
};

export default function UsersPage() {
    const notify = useNotify();
    const [users, setUsers] = useState<TUser[] | null>(null);
    const [me, setMe] = useState<TUser | null>(null);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<TUser | null>(null);
    const [busy, setBusy] = useState(false);
    const isFullAdmin = me?.role === 'ROLE_FULL_ADMIN';

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({ defaultValues: { email: '', role: 'ROLE_ADMIN' } });

    const load = useCallback(async () => {
        try {
            setUsers(await api<TUser[]>('/api/admin/users'));
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

    const onSubmit = async (data: FormValues) => {
        setBusy(true);
        try {
            await api('/api/admin/users', { method: 'POST', json: data });
            notify.success('Admin added — they can now sign in with Google');
            setAdding(false);
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
            await api(`/api/admin/users/${deleting.id}`, { method: 'DELETE' });
            notify.success('Deleted');
            setDeleting(null);
            await load();
        } catch (e) {
            notify.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const onRoleChange = async (id: number, role: TUserRole) => {
        try {
            await api(`/api/admin/users/${id}`, { method: 'PATCH', json: { role } });
            notify.success('Role updated');
            await load();
        } catch (e) {
            notify.error(errorMessage(e));
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Admins</h1>
                    <p className="text-sm text-base-content/60">Only these Google accounts can sign in</p>
                </div>
                {isFullAdmin && (
                    <button
                        className="btn btn-primary btn-sm gap-2"
                        onClick={() => {
                            reset({ email: '', role: 'ROLE_ADMIN' });
                            setAdding(true);
                        }}
                    >
                        <FaPlus className="text-xs" /> Add
                    </button>
                )}
            </div>

            {!users ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            {isFullAdmin && <th className="w-20"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isSelf = me?.id === user.id;
                            return (
                                <tr key={user.id}>
                                    <td>
                                        {user.email}{' '}
                                        {isSelf && <span className="badge badge-ghost badge-sm ml-1">you</span>}
                                    </td>
                                    <td>
                                        {isFullAdmin && !isSelf ? (
                                            <select
                                                className="select select-sm"
                                                value={user.role}
                                                onChange={e => onRoleChange(user.id, e.target.value as TUserRole)}
                                            >
                                                <option value="ROLE_ADMIN">{ROLE_LABELS.ROLE_ADMIN}</option>
                                                <option value="ROLE_FULL_ADMIN">{ROLE_LABELS.ROLE_FULL_ADMIN}</option>
                                            </select>
                                        ) : (
                                            ROLE_LABELS[user.role]
                                        )}
                                    </td>
                                    {isFullAdmin && (
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm btn-square text-error"
                                                disabled={isSelf}
                                                onClick={() => setDeleting(user)}
                                            >
                                                <MdDelete className="text-lg" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <Modal
                id="add-user"
                isOpen={adding}
                title="Add admin"
                onConfirm={handleSubmit(onSubmit)}
                onClose={() => setAdding(false)}
                showCancel={false}
                confirmText="Add"
                isLoading={busy}
            >
                <div className="flex flex-col gap-3">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Google email</legend>
                        <input
                            {...register('email', { required: 'Required' })}
                            type="email"
                            placeholder="name@gmail.com"
                            className={`input w-full ${errors.email ? 'input-error' : ''}`}
                        />
                        {errors.email && <p className="text-error text-sm">{errors.email.message}</p>}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Role</legend>
                        <select {...register('role')} className="select w-full">
                            <option value="ROLE_ADMIN">{ROLE_LABELS.ROLE_ADMIN}</option>
                            <option value="ROLE_FULL_ADMIN">{ROLE_LABELS.ROLE_FULL_ADMIN}</option>
                        </select>
                    </fieldset>
                </div>
            </Modal>

            <Modal
                id="delete-user"
                isOpen={deleting !== null}
                title="Remove admin?"
                onConfirm={onDelete}
                onClose={() => setDeleting(null)}
                isLoading={busy}
            >
                {deleting?.email} will lose access to the admin panel.
            </Modal>
        </div>
    );
}
