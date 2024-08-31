export type Model = {
    id: string;
    name: string;
    version: string;
    description: string;
    is_active: boolean;
};

export interface ModalProps {
    open: boolean
    setOpen: () => void
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    variant?: ModalVariant
    confirmText?: string
    cancelText?: string
}

export type ModalVariant = 'neutral' | 'delete' | 'success';
