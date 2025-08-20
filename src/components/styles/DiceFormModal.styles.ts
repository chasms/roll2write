import { css, cva } from "../../../styled-system/css";

export const DiceFormModalOverlayClass = css({
  position: "fixed",
  inset: 0,
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: 4,
  backgroundColor: { base: "whiteAlpha.100", _dark: "blackAlpha.400" },
});

export const DiceFormModalFormClass = css({
  backgroundColor: "transparent",
  color: "black",
  borderRadius: "md",
  padding: 6,
  maxWidth: "800px",
  width: "full",
  maxHeight: "90vh",
  overflowY: "auto",
  display: "grid",
  gap: 6,
  gridTemplateColumns: { base: "1fr", md: "1fr 1fr" },
});

export const DiceFormModalTitleClass = css({
  fontSize: "2xl",
  marginBottom: 4,
});
export const DiceFormModalLabelBlockClass = css({
  display: "block",
  marginBottom: 2,
});
export const DiceFormModalTextInputClass = css({
  border: "1px solid",
  width: "full",
  paddingLeft: 2,
  paddingRight: 2,
  paddingTop: 1,
  paddingBottom: 1,
});
export const DiceFormModalSidesContainerClass = css({ marginBottom: 3 });
export const DiceFormModalCustomSidesInputClass = css({
  border: "1px solid",
  paddingLeft: 2,
  paddingRight: 2,
  paddingTop: 1,
  paddingBottom: 1,
  width: 28,
});
export const DiceFormModalColorPickerWrapperClass = css({ marginBottom: 4 });
export const DiceFormModalColorInputClass = css({
  width: 16,
  height: 10,
  padding: 0,
  border: "1px solid",
});
export const DiceFormModalPatternFieldsetClass = css({
  border: "1px solid",
  padding: 3,
  borderRadius: "sm",
});
export const DiceFormModalPatternLegendClass = css({
  paddingLeft: 1,
  paddingRight: 1,
});
export const DiceFormModalPatternOptionsClass = css({
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
});
export const DiceFormModalPatternOptionLabelClass = css({
  display: "flex",
  alignItems: "center",
  gap: 1,
});
export const DiceFormModalOptionsScrollAreaClass = css({
  maxHeight: 64,
  overflowY: "auto",
  border: "1px solid",
  padding: 2,
  marginBottom: 4,
});
export const DiceFormModalOptionRowClass = css({
  display: "flex",
  marginBottom: 2,
  alignItems: "center",
});
export const DiceFormModalOptionIndexClass = css({ width: 10 });
export const DiceFormModalOptionInputClass = css({
  flex: 1,
  border: "1px solid",
  paddingLeft: 2,
  paddingRight: 2,
  paddingTop: 1,
  paddingBottom: 1,
});
export const DiceFormModalErrorsListClass = css({
  color: "red.600",
  marginBottom: 4,
});
export const DiceFormModalActionsRowClass = css({ display: "flex", gap: 3 });
export const DiceFormModalPreviewWrapperClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const sidePresetButtonClass = cva({
  base: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    marginRight: 2,
    marginBottom: 2,
    borderRadius: "sm",
  },
  variants: {
    selected: {
      true: { backgroundColor: "gray.700", color: "white" },
      false: { backgroundColor: "gray.200", color: "black" },
    },
  },
});
