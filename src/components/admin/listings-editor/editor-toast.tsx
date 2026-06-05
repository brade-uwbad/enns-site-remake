"use client";

type EditorToastProps = {
  message: string;
  onDismiss: () => void;
};

function isErrorMessage(message: string) {
  return /fail|error|could not|invalid|required/i.test(message);
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
