import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  headerAction,
  footer,
  padding = "md",
}) => {
  const paddingMap = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`bg-niyam-surface rounded-lg border border-niyam-border shadow-subtle text-niyam-text ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-4 sm:px-6 py-4 border-b border-niyam-border flex items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-bold text-niyam-text tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-niyam-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={paddingMap[padding]}>{children}</div>
      {footer && (
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/70 border-t border-niyam-border rounded-b-lg flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
