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

        /*


        const follow_point = this.renderer.getFollowPoint();
        const y = this.renderer.canvas.height * 2.0/3.0

        for (let i = 215; i < this.renderer.canvas.width; i += 400) {
            let campfire: SubObject[] = [
                {x: i + 25, y: y - 20, apothem: 40, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(250, 162, 0, 1)", priority: 1, rotation: 90},


                {x: i + 35, y: y - 60, width: 10, height: 70, priority: 2, shape: "rectangle" as Shape, fillStyle: "rgba(77, 52, 16, 1)", rotation: 135},
                {x: i + 10, y: y - 60, width: 10, height: 70, priority: 2, shape: "rectangle" as Shape, fillStyle: "rgba(89, 74, 53, 1)", rotation: 225},


            ]

            this.renderparts.push(...campfire)
        }

        for (let i = 15; i < this.renderer.canvas.width; i += 400) {
            let tree: SubObject[] = [
                {x: i - 20, y: y - 200, height: 200, width: 20, priority: 1, shape: "rectangle" as Shape, fillStyle: "rgb(93, 52, 0)"},
                {x: i - 5, y: y - 240, apothem: 90, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 180, apothem: 120, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 100, apothem: 150, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90}
            ]
            this.renderparts.push(...tree)
        }
        */
    }

    collision(otherObject: BaseRenderable): void {

    }


}