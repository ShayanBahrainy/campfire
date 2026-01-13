import { BaseRenderable, NoneRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Shape } from "./engine/shape.js";

export class MapMaker implements NoneRenderable {
    x: number;
    y: number;

    shape: "none";

    priority: number;

    fillStyle: string;

    renderer: Renderer;

    renderparts?: SubObject[];

    prevcx: number;
    prevcy: number;

    constructor(renderer: Renderer) {
        renderer.addObject(this);
        this.renderer = renderer;

        this.x = 0;
        this.y = 0;

        this.prevcx = Infinity;
        this.prevcy = Infinity;

        this.shape = "none";

        this.priority = 2;

        this.fillStyle = "";
    }

    private generateChunk(x: number, y: number, width: number): SubObject[] {
        const components: SubObject[] = []


        for (let i = Math.floor(x / 400) * 400 + 175; i < width + x; i += 400) {
            let campfire: SubObject[] = [
                {x: i + 25, y: y - 20, apothem: 40, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(250, 162, 0, 1)", priority: 1, rotation: 90},


                {x: i + 35, y: y - 60, width: 10, height: 70, priority: 2, shape: "rectangle" as Shape, fillStyle: "rgba(77, 52, 16, 1)", rotation: 135},
                {x: i + 10, y: y - 60, width: 10, height: 70, priority: 2, shape: "rectangle" as Shape, fillStyle: "rgba(89, 74, 53, 1)", rotation: 225},


            ]

            components.push(...campfire)
        }

        for (let i = Math.floor(x / 400) * 400; i < width + x; i += 400) {
            let tree: SubObject[] = [
                {x: i - 20, y: y - 200, height: 200, width: 20, priority: 1, shape: "rectangle" as Shape, fillStyle: "rgb(93, 52, 0)"},
                {x: i - 5, y: y - 240, apothem: 90, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 180, apothem: 120, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 100, apothem: 150, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90}
            ]
            components.push(...tree)
        }

        return components;
    }

    update(): void {

        const h_chunk_factor = 800;
        const v_chunk_factor = 600;

        const follow_point = this.renderer.getFollowPoint();


        const cx = Math.floor(follow_point.x / h_chunk_factor);
        const cy = Math.floor(follow_point.y / v_chunk_factor);

        if (cx == this.prevcx && cy == this.prevcy) {
            return;
        }

        this.renderparts = [];

        for (let i = cx - 3; i < cx + 3; i++) {
            for (let j = cy - 3; j < cy + 3; j++) {
                this.renderparts.push(...this.generateChunk(i * h_chunk_factor, j * v_chunk_factor - 200, h_chunk_factor));
            }
        }

        this.prevcx = cx;
        this.prevcy = cy;

    }

    collision(otherObject: BaseRenderable, subObject?: SubObject): void {

    }

}