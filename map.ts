import { Chunk } from "./chunk.js";
import { BaseRenderable, NoneRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";

export class MapMaker implements NoneRenderable {
    x: number;
    y: number;

    shape: "none";

    priority: number;

    fillStyle: string;

    renderer: Renderer;

    prevcx: number;
    prevcy: number;

    chunks: Map<number, Map<number, Chunk>>;

    constructor(renderer: Renderer) {

        this.chunks = new Map<number, Map<number, Chunk>>();

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

    update(): void {
        const h_chunk_factor = 800;
        const v_chunk_factor = 600;

        const follow_point = this.renderer.getFollowPoint();

        const cx = Math.floor(follow_point.x / h_chunk_factor);
        const cy = Math.floor(follow_point.y / v_chunk_factor);

        if (cx == this.prevcx && cy == this.prevcy) {
            return;
        }

        for (let x of this.chunks.keys()) {
            for (let y of this.chunks.get(x).keys()) {
                if (x > cx + 2 || x < cx - 2 || y > cy + 2 || y < cy - 2) {
                    this.chunks.get(x).get(y).destruct();
                    this.chunks.get(x).delete(y);
                }
            }
        }

        for (let i = cx - 2; i < cx + 3; i++) {
            for (let j = cy - 2; j < cy + 3; j++) {
                if (!this.chunks.get(i)) {
                    this.chunks.set(i, new Map<number, Chunk>());
                }

                if (!this.chunks.get(i).get(j)) {
                    this.chunks.get(i).set(j, new Chunk(this.renderer, i * h_chunk_factor, j * v_chunk_factor - 200, h_chunk_factor));
                }
            }
        }

        this.prevcx = cx;
        this.prevcy = cy;
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject): void {

    }

}