import { BaseRenderable } from "./renderable.js";

export function isRecieveKeyPress(obj: BaseRenderable): obj is BaseRenderable & RecieveKeyPress {
  return typeof (obj as any).handleEvent === "function";
}

export interface RecieveKeyPress {
    handleEvent(this: RecieveKeyPress, ev: KeyboardEvent): void
}