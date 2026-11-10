'use client';

import { useEffect, useState } from 'react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface INotification {
    id: string;
    message: string;
    type?: NotificationType;
    duration?: number;
}

interface INotificationItemProps {
    notification: INotification;
    onRemove: (id: string) => void;
}

const DEFAULT_DURATION = 5000;

function NotificationItem({ notification, onRemove }: INotificationItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const duration = notification.duration ?? DEFAULT_DURATION;

    useEffect(() => {
        const enterTimeout = requestAnimationFrame(() => setIsVisible(true));

        const leaveTimeout = setTimeout(() => {
            setIsLeaving(true);
        }, duration);

        const removeTimeout = setTimeout(() => {
            onRemove(notification.id);
        }, duration + 300);

        return () => {
            cancelAnimationFrame(enterTimeout);
            clearTimeout(leaveTimeout);
            clearTimeout(removeTimeout);
        };
    }, [notification.id, duration, onRemove]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => onRemove(notification.id), 300);
    };

    const alertClass = {
        info: 'alert-info',
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-error',
    }[notification.type ?? 'info'];

    const icon = {
        info: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        success: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        warning: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        ),
        error: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    }[notification.type ?? 'info'];

    return (
        <div
            className={`alert ${alertClass} shadow-lg transition-all duration-300 ease-in-out ${
                isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            {icon}
            <span>{notification.message}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                ✕
            </button>
        </div>
    );
}

interface INotificationContainerProps {
    notifications: INotification[];
    onRemove: (id: string) => void;
}

export default function NotificationContainer({ notifications, onRemove }: INotificationContainerProps) {
    if (notifications.length === 0) return null;

    return (
        <div className="toast toast-end toast-bottom z-[9999]">
            {notifications.map(n => (
                <NotificationItem key={n.id} notification={n} onRemove={onRemove} />
            ))}
        </div>
    );
}
