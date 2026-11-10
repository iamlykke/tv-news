import React, { useEffect, useRef } from 'react';

interface IModalProps {
    id?: string;
    type?: 'info' | 'error';
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children?: React.ReactNode;
    onConfirm?: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

export default function Modal({
    id,
    type = 'info',
    isOpen,
    onClose,
    title,
    children,
    onConfirm,
    isLoading = false,
    confirmText = 'ОК',
    cancelText = 'Отмена',
    showCancel = true,
}: IModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const modalBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => {
            if (onClose) onClose();
        };

        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const modalBox = modalBoxRef.current;
        if (!modalBox || isLoading) return;

        const rect = modalBox.getBoundingClientRect();
        const isClickOutside =
            e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;

        if (isClickOutside && onClose) {
            onClose();
        }
    };

    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
        if (isLoading) {
            e.preventDefault();
        }
    };

    const hasActions = onConfirm || showCancel;

    return (
        <dialog id={id} ref={dialogRef} className="modal" onClick={handleBackdropClick} onCancel={handleCancel}>
            <div ref={modalBoxRef} className="modal-box p-6">
                <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    ✕
                </button>

                <h2 className={`text-lg font-bold mb-4 ${type === 'error' ? 'text-error' : ''}`}>{title}</h2>

                {children && <div className="mb-6">{children}</div>}

                {hasActions && (
                    <div className="modal-action mt-0 flex justify-end gap-3">
                        {showCancel && (
                            <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-outline">
                                {cancelText}
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                type="button"
                                onClick={() => onConfirm && onConfirm()}
                                disabled={isLoading}
                                className={`btn btn-neutral ${!showCancel ? 'w-full' : ''}`}
                            >
                                {isLoading ? <span className="loading loading-spinner loading-sm" /> : confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </dialog>
    );
}
