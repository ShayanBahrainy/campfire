import { Renderable } from "./renderable.js";

export function isRecieveKeyPress(obj: Renderable): obj is Renderable & RecieveKeyPress {
  return typeof (obj as any).handleEvent === "function";
}

export interface RecieveKeyPress {
    handleEvent(this: RecieveKeyPress, ev: KeyboardEvent): void
}