import React from "react";
import { cva, cx } from "../../styled-system/css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number | string;
  height?: number | string;
  variant?: "primary" | "secondary" | "ghost";
  busy?: boolean;
}

const buttonRecipe = cva({
  base: {
    fontWeight: "medium",
    rounded: "sm",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.15s, color 0.15s, box-shadow 0.15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    px: 3,
    py: 2,
    outline: "none",
    _focusVisible: {
      boxShadow: "0 0 0 3px token(colors.blue.300)",
    },
    _disabled: {
      opacity: 0.55,
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      primary: {
        bg: { base: "blue.600", _dark: "blue.400" },
        color: { base: "white", _dark: "gray.900" },
        _hover: { bg: { base: "blue.700", _dark: "blue.300" } },
        _active: { bg: { base: "blue.800", _dark: "blue.200" } },
      },
      secondary: {
        bg: { base: "gray.200", _dark: "gray.700" },
        color: { base: "gray.900", _dark: "gray.100" },
        _hover: { bg: { base: "gray.300", _dark: "gray.600" } },
        _active: { bg: { base: "gray.400", _dark: "gray.500" } },
      },
      ghost: {
        bg: "transparent",
        color: { base: "gray.800", _dark: "gray.100" },
        _hover: { bg: { base: "gray.100", _dark: "gray.800" } },
        _active: { bg: { base: "gray.200", _dark: "gray.700" } },
      },
    },
  },
  defaultVariants: { variant: "secondary" },
});

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
                height:
                  typeof height === "number" ? String(height) + "px" : height,
              }
            : {}),
        }
      : undefined;
  return (
    <button
      className={cx(buttonRecipe({ variant }), className)}
      disabled={disabled ?? busy}
      aria-busy={busy ? true : undefined}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </button>
  );
};
