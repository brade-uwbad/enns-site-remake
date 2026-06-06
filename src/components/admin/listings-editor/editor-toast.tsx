"use client";

import { Check, X } from "lucide-react";

type EditorToastProps = {
  message: string;
  onDismiss: () => void;
};

function isErrorMessage(message: string) {
  return /fail|error|could not|invalid|required|must sign in/i.test(message);
}

export function EditorToast({ message, onDismiss }: EditorToastProps) {
  const error = isErrorMessage(message);

  return (
    <div
      className={`fixed right-4 top-[7.25rem] z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg sm:right-6 sm:top-20 ${
        error
          ? "border-red-200 bg-white text-red-800"
          : "border-emerald-200 bg-white text-emerald-900"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          error ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
        }`}
        aria-hidden
      >
        {error ? <X className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </span>
      <p className="flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-slate-400 transition hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
