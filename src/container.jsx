import { forwardRef } from "react";

export const Container = forwardRef(
  ({ children, label, className, listeners, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={`bg-white border border-gray-400 rounded ${className}`}
      >
        <div {...listeners} className="px-4 py-4 border-b border-gray-400">
          {label}
        </div>

        <div className="px-4 py-4 space-y-4">{children}</div>
      </div>
    );
  }
);
