import { Line } from "./engine/line.js";
import { Point } from "./engine/point.js";
import { BaseRenderable, CircleRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Shape } from "./engine/shape.js";

export class Snowball implements CircleRenderable {

    vx: number;
    vy: number;

    shape: "circle";
    priority: number;
    fillStyle: string;

    renderer: Renderer;

    radius: number;
    angle: number;

    nocollide: boolean;

    constructor(public x: number, public y: number, renderer: Renderer) {
        renderer.addObject(this);
        this.shape = "circle";
        this.vx = -2 + Math.random() * 10;
        this.vy = 1;
        this.fillStyle = "rgb(255,255,255)"
        this.priority = 5;
        this.renderer = renderer;

        this.radius = 10;
        this.angle = 360;

        this.nocollide = false;
    }

    update(): void {
        this.x += this.vx;
        this.y += this.vy;
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject): void {
        if (otherObject instanceof Snowball) return;
        this.nocollide = true;
        this.vx = 0;
        this.vy = 0;
    }
}