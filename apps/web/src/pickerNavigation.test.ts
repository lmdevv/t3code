import { describe, expect, it } from "vite-plus/test";

import { pickerNavigationDirectionFromCommand } from "./pickerNavigation";

describe("picker navigation", () => {
  it("maps picker commands to directions", () => {
    expect(pickerNavigationDirectionFromCommand("picker.previous")).toBe("previous");
    expect(pickerNavigationDirectionFromCommand("picker.next")).toBe("next");
    expect(pickerNavigationDirectionFromCommand("filePicker.toggle")).toBeNull();
  });
});
