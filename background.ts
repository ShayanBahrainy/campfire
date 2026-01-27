import { BaseRenderable, NoneRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Shape } from "./engine/shape.js";

export class Background implements NoneRenderable {
    priority: number;

    shape: "none";
    fillStyle: string;

    renderparts: SubObject[];

    x: number;
    y: number;

    prevWidth: number;
    prevHeight: number;

    constructor(private renderer: Renderer) {
        this.priority = 0;
        this.shape = "none";
        this.x = 0;
        this.y = 0;
        this.renderparts = [
            //Sky
            ...[
                {shape: "rectangle" as Shape, x: 0, y: 0, priority: -100, fillStyle: "rgba(2, 2, 110, 1)", width: this.renderer.canvas.width, height: this.renderer.canvas.height, nocollide: true, screenpositioning: true},
            ]
        ]
        this.renderer.addObject(this);

        this.prevWidth = this.renderer.canvas.width;
        this.prevHeight = this.renderer.canvas.height;

    }

    update() {
        if (this.renderer.canvas.width != this.prevWidth || this.renderer.canvas.height != this.prevHeight) {
            this.renderparts = [
                //Sky
                ...[
                    {shape: "rectangle" as Shape, x: 0, y: 0, priority: -100, fillStyle: "rgba(2, 2, 110, 1)", width: this.renderer.canvas.width, height: this.renderer.canvas.height, nocollide: true, screenpositioning: true},
                ]
            ]

            this.prevHeight = this.renderer.canvas.height;
            this.prevWidth = this.renderer.canvas.width;
        }
    }

    collision(otherObject: BaseRenderable): void {

    }


}