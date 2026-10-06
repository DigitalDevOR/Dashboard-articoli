import { create } from "zustand";

export type ToastVariant = "success" | "error";

export type ToastItem = {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
};

type ToastStore = {
    toasts: ToastItem[];
    addToast: (toast: Omit<ToastItem, "id">) => string;
    removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));
        return id;
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
}));