"use client";

import { type ReactNode } from "react";
import toast, { Toaster, type Toast } from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/ui";

type ToastTone = "success" | "error" | "info";

type AppToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

function AppToastCard({
  toastRef,
  tone,
  title,
  message,
  actionLabel,
  onAction,
}: {
  toastRef: Toast;
  tone: ToastTone;
  title: ReactNode;
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const icon =
    tone === "success" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : tone === "error" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Info className="h-4 w-4" />
    );

  return (
    <div
      aria-live="polite"
      className={cn("app-hot-toast", toastRef.visible && "animate-[float-in_260ms_cubic-bezier(0.18,0.9,0.2,1)]")}
      data-tone={tone}
    >
      <div className="app-hot-toast-icon">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="app-hot-toast-title">{title}</div>
        <div className="app-hot-toast-message">{message}</div>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="app-hot-toast-action"
            onClick={() => {
              onAction();
              toast.dismiss(toastRef.id);
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => toast.dismiss(toastRef.id)}
        className="app-hot-toast-close"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function appToast(
  tone: ToastTone,
  title: ReactNode,
  message: ReactNode,
  options?: AppToastOptions
) {
  return toast.custom(
    (toastRef) => (
      <AppToastCard
        toastRef={toastRef}
        tone={tone}
        title={title}
        message={message}
        actionLabel={options?.actionLabel}
        onAction={options?.onAction}
      />
    ),
    {
      duration: options?.actionLabel && options?.onAction ? 5600 : options?.duration ?? 3600,
    }
  );
}

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={14}
      reverseOrder={false}
      containerClassName="app-toaster"
      toastOptions={{
        duration: 3600,
      }}
    />
  );
}
