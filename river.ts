import { BaseRenderable, RectangleRenderable, SubObject } from "./engine/renderable.js";
import { MapMaker } from "./map.js";
import { Renderer } from "./engine/renderer.js";

export class River implements RectangleRenderable {
    shape: "rectangle";

    fillStyle: string;

    priority: number;

    width: number;

    height: number;

    constructor(public x: number, public y: number, public renderer: Renderer) {
        renderer.addObject(this);

        this.shape = "rectangle";
        this.fillStyle = "rgb(78, 78, 168)";

        this.width = MapMaker.HORIZONTAL_CHUNK_FACTOR;

        this.height = 100;

        this.x = 0;
        this.y = 0;

        this.priority = 1;
    }

    update(): void {
        const follow_point = this.renderer.getFollowPoint();

        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR) * MapMaker.VERTICAL_CHUNK_FACTOR;

        this.x = cx;
        this.y = cy + 300;
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject, childObject?: SubObject): void {

    }
}