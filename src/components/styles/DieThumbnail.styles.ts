import { css, cva } from "../../../styled-system/css";

export const DIE_THUMBNAIL_SIZE = 60; // default fallback size

export const dieThumbnailOuterClass = cva({
  base: {
    position: "relative",
    userSelect: "none",
    transitionProperty: "transform",
    transitionDuration: "fast",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1",
  },
  variants: {
    interactive: {
      true: { cursor: "pointer", _hover: { transform: "scale(1.05)" } },
      false: { cursor: "default" },
    },
  },
  defaultVariants: { interactive: false },
});

export const dieThumbnailContentOverlayClass = css({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "xs",
  fontWeight: "bold",
  textAlign: "center",
  paddingLeft: 4,
  paddingRight: 4,
  lineHeight: 1.1,
  color: "white",
  pointerEvents: "none",
});

export const dieThumbnailStrokeSvgClass = css({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
});
