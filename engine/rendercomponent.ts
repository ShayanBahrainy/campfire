import { Shape } from "./shape.ts";
import { Point } from "./point.ts"

export interface RenderComponent {
    x: number;
    y: number;
    type: Shape | "text";
    fillStyle?: string;
    text?: string;
    angle?: number;
    rotation?: number;
    apothem?: number;
    vertexes?: number;
    width?: number;
    height?: number;
    dominant?: boolean;
    radius?: number;
    end?: Point;
}