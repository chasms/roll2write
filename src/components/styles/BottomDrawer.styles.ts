import { css, cva } from "../../../styled-system/css";

export const bottomDrawerContainerClass = cva({
  base: {
    transition: "height 0.25s",
    overflow: "hidden",
    borderTop: "1px solid",
    backgroundColor: "gray.300",
    zIndex: 20,
    width: "100%",
  },
  variants: {},
});

export const bottomDrawerInnerClass = css({
  height: 56,
  display: "flex",
  flexDirection: "column",
});
export const bottomDrawerHeaderClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: 3,
  paddingRight: 3,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
});
export const bottomDrawerContentClass = css({
  paddingLeft: 3,
  paddingRight: 3,
  overflowX: "auto",
  flex: 1,
  display: "flex",
  gap: 3,
  alignItems: "center",
});
