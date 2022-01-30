import { forwardRef } from "react";

export const Item = forwardRef(({ children, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      {...rest}
      className={`px-4 py-4 bg-white border border-gray-400 rounded ${className}`}
    >
      {children}
    </div>
  );
});
