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

export type Message = {
    chat_id: string;
    user_id: string;
    role: string;
    content: string;
    created_at: string;
    is_edited: boolean;
    ai_model_version?: string;
}
