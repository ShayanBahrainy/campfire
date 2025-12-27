import { Shape } from './shape.js';
import { Point } from './point.js'

export function isSubObject(obj: (SubObject | Renderable)): obj is SubObject {
  return "_parent" in obj;
}

export interface Renderable {
    update(): void;
    collision(otherObject: Renderable, subObject?: SubObject): void;
    x: number;
    y: number;
    shape: Shape | "none";
    priority: number;
    fillStyle: string;
    width?: number;
    height?: number;
    angle?: number;
    rotation?: number;
    radius?: number;
    end?: Point;
    renderparts?: SubObject[];
    text?: string;
    isdominant?: boolean;
    apothem?: number;
    vertexes?: number;
}

export interface SubObject {
    x: number;
    y: number;
    shape: Shape;
    priority: number;
    fillStyle: string;
    width?: number;
    height?: number;
    angle?: number;
    rotation?: number;
    radius?: number;
    end?: Point;
    text?: string;
    isdominant?: boolean;
    apothem?: number;
    vertexes?: number;
    _parent?: Renderable;
}