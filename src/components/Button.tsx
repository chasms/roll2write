import React from "react";
import styles from "./Button.module.scss";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number | string;
  height?: number | string;
  variant?: "primary" | "secondary" | "ghost" | "fae";
  busy?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  width,
  height,
  variant = "secondary",
  busy,
  disabled,
  className,
  children,
  style,
  ...rest
}) => {
  const resolvedStyle: React.CSSProperties | undefined =
    width || height || style
      ? {
          ...style,
          ...(width !== undefined
            ? {
                width: typeof width === "number" ? String(width) + "px" : width,
              }
            : {}),
          ...(height !== undefined
            ? {
                height: typeof height === "number" ? String(height) + "px" : height,
              }
            : {}),
        }
      : undefined;
  return (
    <button
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      disabled={disabled ?? busy}
      aria-busy={busy ? true : undefined}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </button>
  );
};
