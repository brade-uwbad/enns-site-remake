import Image from "next/image";
import Link from "next/link";

import { checkPassword, type PasswordChecks } from "@/lib/auth/password";

export function AuthLogo() {
  return (
    <div className="mb-6 flex justify-center">
      <Image src="/logo.svg" alt="Enns Real Estate" width={140} height={32} className="h-8 w-auto" />
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 text-center">
      <h1 className="text-2xl font-semibold text-[#140000]">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm leading-relaxed text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-zinc-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[#140000] placeholder:text-zinc-400 focus:border-[#4a6d95] focus:outline-none focus:ring-1 focus:ring-[#4a6d95]"
      />
    </div>
  );
}

export function AuthPrimaryButton({
  children,
  disabled,
  type = "submit",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg bg-[#4a6d95] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3f5f84] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const checks: PasswordChecks = checkPassword(password);
  const items = [
    { ok: checks.hasMinLength, label: "At least 8 characters" },
    { ok: checks.hasLetter, label: "One letter" },
    { ok: checks.hasNumber, label: "One number" },
  ];
  return (
    <ul className="mt-2 space-y-0.5 text-xs text-zinc-500">
      {items.map((item) => (
        <li key={item.label} className={item.ok ? "text-zinc-600" : ""}>
          • {item.label}
        </li>
      ))}
    </ul>
  );
}

export function RememberForgotRow({
  remember,
  onRememberChange,
  forgotHref,
}: {
  remember: boolean;
  onRememberChange: (value: boolean) => void;
  forgotHref: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex cursor-pointer items-center gap-2 text-zinc-600">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-[#4a6d95] focus:ring-[#4a6d95]"
        />
        Remember me
      </label>
      <Link href={forgotHref} className="text-[#4a6d95] hover:underline">
        Forgot password?
      </Link>
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-zinc-600">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-[#4a6d95] hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}

export function AuthConfigWarning({ searchError }: { searchError?: string | null }) {
  return (
    <>
      {searchError === "config" ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sign-in.
        </p>
      ) : null}
    </>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-600">{message}</p>;
}
