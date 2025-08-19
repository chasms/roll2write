// Drawer always open variant (no state needed)
import { css, cva } from "../../styled-system/css";

interface BottomDrawerProps {
  title: string;
  children: React.ReactNode;
}

const drawerContainerClass = cva({
  base: {
    transition: "height 0.25s",
    overflow: "hidden",
    borderTop: "1px solid",
    bg: "gray.300",
    zIndex: 20,
    width: "100%",
  },
  variants: {},
});

const drawerInnerClass = css({ h: 56, display: "flex", flexDir: "column" });
const drawerHeaderClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 3,
  py: 2,
  fontWeight: "bold",
});
const drawerContentClass = css({
  px: 3,
  overflowX: "auto",
  flex: 1,
  display: "flex",
  gap: 3,
  alignItems: "center",
});

export function BottomDrawer({ title, children }: BottomDrawerProps) {
  return (
    <div className={drawerContainerClass({})}>
      <div className={drawerInnerClass}>
        <div className={drawerHeaderClass}>
          <span>{title}</span>
        </div>
        <div className={drawerContentClass}>{children}</div>
      </div>
    </div>
  );
}
