import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-800">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ember-400/50",
            error ? "border-error-500" : "border-ink-200 focus:border-ember-400",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
