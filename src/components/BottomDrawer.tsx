// Drawer always open variant (no state needed)
import {
  bottomDrawerContainerClass,
  bottomDrawerContentClass,
  bottomDrawerHeaderClass,
  bottomDrawerInnerClass,
} from "./styles/BottomDrawer.styles";

interface BottomDrawerProps {
  title: string;
  children: React.ReactNode;
}

export function BottomDrawer({ title, children }: BottomDrawerProps) {
  return (
    <div className={bottomDrawerContainerClass({})}>
      <div className={bottomDrawerInnerClass}>
        <div className={bottomDrawerHeaderClass}>
          <span>{title}</span>
        </div>
        <div className={bottomDrawerContentClass}>{children}</div>
      </div>
    </div>
  );
}
