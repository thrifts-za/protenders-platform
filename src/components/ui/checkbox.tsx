"use client";

import * as React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  icon?: React.ReactNode;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, checked, label, icon, id, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={`h-4 w-4 rounded-sm border border-primary text-primary focus:ring-2 focus:ring-primary ${className}`}
        checked={!!checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {label}
        </label>
      )}
    </div>
  )
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

