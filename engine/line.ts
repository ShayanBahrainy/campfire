import { Renderer } from "./renderer.js"
import { Renderable } from "./renderable.ts"
import { Point } from "./point.ts"
import { Shape } from "./shape.ts";

export class LineInert implements Renderable{
   x: number;
   y: number;
   shape: Shape;
   priority: number;
   fillStyle: string;

   end: Point;
   width: number;
    constructor(start: Point, end: Point, width: number) {
        this.x = start.x
        this.y = start.y
        this.end = end
        this.shape = "line"
        this.width = width
        this.priority = 0
        this.fillStyle = "rgb(255, 255, 255)"
    }

    update() {

    }

    collision () {
        
    }
}

export class Line implements Renderable {
    x: number;
    y: number;
    shape: Shape;
    priority: number;
    fillStyle: string;

    end: Point;
    width: number;
    constructor(start: Point, end: Point, width: number, renderer: Renderer) {
        renderer.addObject(this)
        this.x = start.x
        this.y = start.y
        this.end = end
        this.width = width
        this.shape = "line"
        this.width = width
        this.priority = 0
        this.fillStyle = "rgb(255, 255, 255)"
    }

    update() {

    }

    collision () {
        
    }
}