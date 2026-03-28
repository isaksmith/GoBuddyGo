export const TEXT_SCALE: Record<"small" | "medium" | "large", number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
};

export function getTextScale(textSize: "small" | "medium" | "large" | undefined): number {
  return TEXT_SCALE[textSize ?? "medium"];
}
