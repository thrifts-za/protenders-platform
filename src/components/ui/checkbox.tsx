"use client";

import * as React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, checked, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 rounded-sm border border-primary text-primary focus:ring-2 focus:ring-primary ${className}`}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

