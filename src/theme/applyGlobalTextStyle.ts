import { Text } from "react-native";

export function applyGlobalAntonFont() {
  const AnyText: any = Text;
  AnyText.defaultProps = AnyText.defaultProps || {};
  const existing = AnyText.defaultProps.style;
  AnyText.defaultProps.style = [{ fontFamily: "Anton" }, existing].filter(Boolean);
}
