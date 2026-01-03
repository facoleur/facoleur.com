"use client";

import { Button } from "@/components/ui/button";

type AuditUnlockFormProps = {
  email: string;
  buttonLabel: string;
  error?: string | null;
  helperText?: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  disabled?: boolean;
};

export function AuditUnlockForm({
  email,
  buttonLabel,
  error,
  helperText,
  onEmailChange,
  onSubmit,
  disabled = false,
}: AuditUnlockFormProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-2 md:flex-row"
      >
        <input
          type="email"
          required
          placeholder="prenom@domaine.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          disabled={disabled}
        />
        <Button type="submit" className="whitespace-nowrap" disabled={disabled}>
          {buttonLabel}
        </Button>
      </form>

      {error ? (
        <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
      ) : null}

      {helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </>
  );
}
