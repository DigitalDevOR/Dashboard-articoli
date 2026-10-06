import * as ToastPrimitive from "@radix-ui/react-toast";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
    React.ElementRef<typeof ToastPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
        ref={ref}
        className={cn(
            "fixed bottom-0 right-0 z-[100] flex w-full max-w-[420px] flex-col gap-2 p-4 sm:bottom-4 sm:right-4",
            className,
        )}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export const Toast = forwardRef<
    React.ElementRef<typeof ToastPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
        variant?: "success" | "error";
    }
>(({ className, variant = "success", ...props }, ref) => (
    <ToastPrimitive.Root
        ref={ref}
        className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-5 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=closed]:duration-300",
            variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            className,
        )}
        {...props}
    />
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;

export const ToastClose = forwardRef<
    React.ElementRef<typeof ToastPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Close
        ref={ref}
        className={cn(
            "ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-lg leading-none opacity-70 outline-none ring-0 hover:bg-black/5 hover:opacity-100 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0",
            className,
        )}
        {...props}
    />
));
ToastClose.displayName = ToastPrimitive.Close.displayName;