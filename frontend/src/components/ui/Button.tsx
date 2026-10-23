import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niyam-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]", // 44px touch target baseline
    lg: "px-6 py-3 text-base min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-niyam-accent text-white hover:bg-niyam-accentHover active:bg-niyam-accentActive shadow-sm",
    secondary:
      "bg-white text-niyam-text border border-niyam-border hover:bg-slate-50 active:bg-slate-100 shadow-sm",
    outline:
      "border border-niyam-border text-niyam-text hover:bg-niyam-accentLight hover:text-niyam-accentHover hover:border-niyam-accent",
    destructive:
      "bg-semantic-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    ghost:
      "text-niyam-secondary hover:text-niyam-text hover:bg-slate-100",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      ) : (
        leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
