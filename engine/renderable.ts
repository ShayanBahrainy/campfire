import { Shape } from './shape.js';
import { Point } from './point.js'

export function isSubObject(obj: (SubObject | BaseRenderable)): obj is SubObject {
  return "_parent" in obj;
}

export interface BaseRenderable {
  update(): void;
  collision(otherObject: BaseRenderable, subObject?: SubObject): void;

  x: number;
  y: number;

  shape: Shape | "none";

  priority: number;

  fillStyle: string;

  isdominant?: boolean;

  text?: string;

  renderparts?: SubObject[];

  rotation?: number;

  nocollide?: boolean;

}

export type RectangleRenderable = (BaseRenderable & {shape: "rectangle", width: number, height: number});
export type CircleRenderable = (BaseRenderable & {shape: "circle", radius: number, angle?: number});
export type LineRenderable = (BaseRenderable & {shape: "line", end: Point, width: number});
export type PolygonRenderable = (BaseRenderable & {shape: "polygon", apothem: number, vertexes: number});
export type NoneRenderable = (BaseRenderable & {shape: "none"});



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
    _parent?: BaseRenderable;
    nocollide?: boolean;
}