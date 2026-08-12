import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "rounded-lg border border-border bg-card px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-accent",
            error && "border-expense focus:border-expense",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-expense">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
