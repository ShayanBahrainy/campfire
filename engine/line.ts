import { Renderer } from "./renderer.js"
import { LineRenderable } from "./renderable.js"
import { Point } from "./point.js"
import { Shape } from "./shape.js";

export class LineInert{
    constructor(public start: Point, public end: Point) {

    }
}

export class Line implements LineRenderable {
    x: number;
    y: number;
    shape: "line";
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