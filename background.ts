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

    constructor(private renderer: Renderer) {
        this.renderer.addObject(this);
        this.priority = 0;
        this.shape = "none";
        this.x = 0;
        this.y = 0;
    }

    update() {
        this.renderparts = [
            //Sky
            ...[
                {shape: "rectangle" as Shape, x: 0, y: 0, priority: 0, fillStyle: "rgba(2, 2, 110, 1)", width: this.renderer.canvas.width, height: this.renderer.canvas.height, nocollide: true, screenpositioning: true},
            ]
        ]
    }

    collision(otherObject: BaseRenderable): void {

    }


}