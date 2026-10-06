import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "./toast";
import { useToastStore } from "../../store/toast.store";

const TOAST_DURATION_MS = 4_000;

export function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    return (
        <ToastProvider swipeDirection="right">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    variant={toast.variant}
                    duration={TOAST_DURATION_MS}
                    onOpenChange={(open) => {
                        if (!open) {
                            removeToast(toast.id);
                        }
                    }}
                >
                    <div className="grid gap-1">
                        <ToastTitle className="font-semibold">{toast.title}</ToastTitle>
                        {toast.description && (
                            <ToastDescription>{toast.description}</ToastDescription>
                        )}
                    </div>
                    <ToastClose aria-label="Chiudi notifica">×</ToastClose>
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
}
