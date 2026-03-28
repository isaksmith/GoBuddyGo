import { useApp } from "@/context/AppContext";
import { getTextScale } from "@/constants/textScale";

export function useTextScale(): number {
  const { settings } = useApp();
  return getTextScale(settings.textSize);
}
