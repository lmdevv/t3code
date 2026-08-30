import type { ResolvedKeybindingsConfig } from "@t3tools/contracts";
import { useEffect } from "react";

import { resolveShortcutCommand } from "./keybindings";

export type PickerNavigationDirection = "previous" | "next";

export function pickerNavigationDirectionFromCommand(
  command: string | null,
): PickerNavigationDirection | null {
  if (command === "picker.previous") return "previous";
  if (command === "picker.next") return "next";
  return null;
}

export function dispatchPickerNavigationKey(
  event: KeyboardEvent,
  direction: PickerNavigationDirection,
): boolean {
  const target = event.target;
  if (!(target instanceof EventTarget)) return false;

  event.preventDefault();
  event.stopImmediatePropagation();
  return target.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: direction === "next" ? "ArrowDown" : "ArrowUp",
      code: direction === "next" ? "ArrowDown" : "ArrowUp",
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
}

export function usePickerNavigationKeybindings(
  keybindings: ResolvedKeybindingsConfig,
  options: {
    readonly enabled?: boolean;
    readonly onNavigate?: (direction: PickerNavigationDirection) => void;
  } = {},
): void {
  const enabled = options.enabled ?? true;
  const onNavigate = options.onNavigate;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const direction = pickerNavigationDirectionFromCommand(
        resolveShortcutCommand(event, keybindings, {
          context: { pickerOpen: true },
        }),
      );
      if (!direction) return;

      if (onNavigate) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onNavigate(direction);
        return;
      }
      dispatchPickerNavigationKey(event, direction);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled, keybindings, onNavigate]);
}
