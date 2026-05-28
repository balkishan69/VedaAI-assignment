import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ─── Input Field ─── */
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  function Field({ label, error, hint, className, ...props }, ref) {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
        </span>
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-3.5 text-sm outline-none transition-all duration-200",
            "placeholder:text-muted/50",
            "focus:border-brand focus:ring-4 focus:ring-brand/10",
            error
              ? "border-coral/60 bg-coral/5 focus:border-coral focus:ring-coral/10"
              : "border-ink/10 hover:border-ink/20",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="mt-1.5 block text-xs font-medium text-coral animate-fade-in">
            {error}
          </span>
        ) : hint ? (
          <span className="mt-1.5 block text-xs text-muted">{hint}</span>
        ) : null}
      </label>
    );
  }
);

/* ─── Textarea ─── */
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ label, error, hint, className, ...props }, ref) {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
        </span>
        <textarea
          ref={ref}
          className={cn(
            "min-h-28 w-full resize-y rounded-lg border bg-white px-3.5 py-3 text-sm outline-none transition-all duration-200",
            "placeholder:text-muted/50",
            "focus:border-brand focus:ring-4 focus:ring-brand/10",
            error
              ? "border-coral/60 bg-coral/5 focus:border-coral focus:ring-coral/10"
              : "border-ink/10 hover:border-ink/20",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="mt-1.5 block text-xs font-medium text-coral animate-fade-in">
            {error}
          </span>
        ) : hint ? (
          <span className="mt-1.5 block text-xs text-muted">{hint}</span>
        ) : null}
      </label>
    );
  }
);

/* ─── Select ─── */
interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, options, className, ...props }, ref) {
    return (
      <label className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            {label}
          </span>
        )}
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-8 text-sm outline-none transition-all duration-200",
            "focus:border-brand focus:ring-4 focus:ring-brand/10",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23687586%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-[position:right_12px_center] bg-no-repeat",
            error
              ? "border-coral/60 bg-coral/5"
              : "border-ink/10 hover:border-ink/20",
            className
          )}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="mt-1.5 block text-xs font-medium text-coral animate-fade-in">
            {error}
          </span>
        )}
      </label>
    );
  }
);
