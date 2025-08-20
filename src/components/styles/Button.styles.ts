import { cva } from "../../../styled-system/css";

export const buttonRecipe = cva({
  base: {
    fontWeight: "medium",
    borderRadius: "sm",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.15s, color 0.15s, box-shadow 0.15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingLeft: 3,
    paddingRight: 3,
    paddingTop: 2,
    paddingBottom: 2,
    outline: "none",
    _focusVisible: { boxShadow: "0 0 0 3px token(colors.blue.300)" },
    _disabled: { opacity: 0.55, cursor: "not-allowed" },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: { base: "blue.600", _dark: "blue.400" },
        color: { base: "white", _dark: "gray.900" },
        _hover: { backgroundColor: { base: "blue.700", _dark: "blue.300" } },
        _active: { backgroundColor: { base: "blue.800", _dark: "blue.200" } },
      },
      secondary: {
        backgroundColor: { base: "gray.200", _dark: "gray.700" },
        color: { base: "gray.900", _dark: "gray.100" },
        _hover: { backgroundColor: { base: "gray.300", _dark: "gray.600" } },
        _active: { backgroundColor: { base: "gray.400", _dark: "gray.500" } },
      },
      ghost: {
        backgroundColor: "transparent",
        color: { base: "gray.800", _dark: "gray.100" },
        _hover: { backgroundColor: { base: "gray.100", _dark: "gray.800" } },
        _active: { backgroundColor: { base: "gray.200", _dark: "gray.700" } },
      },
    },
  },
  defaultVariants: { variant: "secondary" },
});
