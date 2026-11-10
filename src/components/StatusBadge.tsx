import { FaClock, FaEye, FaEyeSlash, FaHourglassEnd, FaTrash } from 'react-icons/fa';
import type { TSlideStatus } from '@/types';

const CONFIG: Record<TSlideStatus, { label: string; className: string; icon: React.ReactNode }> = {
    live: { label: 'В эфире', className: 'badge-success', icon: <FaEye /> },
    hidden: { label: 'Скрыт', className: 'badge-warning', icon: <FaEyeSlash /> },
    scheduled: { label: 'Запланирован', className: 'badge-info', icon: <FaClock /> },
    expired: { label: 'Истёк', className: 'badge-neutral', icon: <FaHourglassEnd /> },
    deleted: { label: 'Удалён', className: 'badge-error', icon: <FaTrash /> },
};

export default function StatusBadge({ status }: { status: TSlideStatus }) {
    const { label, className, icon } = CONFIG[status];
    return (
        <span className={`badge ${className} gap-1.5 text-xs`}>
            {icon}
            {label}
        </span>
    );
}
