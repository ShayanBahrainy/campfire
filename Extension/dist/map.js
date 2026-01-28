import { Chunk } from "./chunk.js";
import { River } from "./river.js";
export class MapMaker {
    constructor(renderer) {
        this.chunks = new Map();
        renderer.addObject(this);
        this.renderer = renderer;
        this.x = 0;
        this.y = 0;
        this.prevcx = Infinity;
        this.prevcy = Infinity;
        this.shape = "none";
        this.priority = 2;
        this.fillStyle = "";
        this.rivers = new Map();
    }
    update() {
        const follow_point = this.renderer.getFollowPoint();
        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR);
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR);
        if (cx == this.prevcx && cy == this.prevcy) {
            return;
        }
        if (this.rivers.get(cy + 1) === undefined) {
            if (this.renderer.generateRandom((cy + 1) * MapMaker.VERTICAL_CHUNK_FACTOR, (cy + 1) * MapMaker.VERTICAL_CHUNK_FACTOR) % 5 == 0) {
                this.rivers.set(cy + 1, new River((cy + 1) * MapMaker.VERTICAL_CHUNK_FACTOR, this.renderer));
            }
            else {
                this.rivers.set(cy + 1, null);
            }
        }
        for (let x of this.chunks.keys()) {
            for (let y of this.chunks.get(x).keys()) {
                if (x > cx + 2 || x < cx - 1 || y > cy + 1 || y < cy - 1) {
                    this.chunks.get(x).get(y).destruct();
                    this.chunks.get(x).delete(y);
                }
            }
        }
        for (let i = cx - 1; i < cx + 3; i++) {
            for (let j = cy - 1; j < cy + 2; j++) {
                if (!this.chunks.get(i)) {
                    this.chunks.set(i, new Map());
                }
                if (!this.chunks.get(i).get(j)) {
                    //!! coerces to bool
                    this.chunks.get(i).set(j, new Chunk(this.renderer, i * MapMaker.HORIZONTAL_CHUNK_FACTOR, j * MapMaker.VERTICAL_CHUNK_FACTOR, MapMaker.HORIZONTAL_CHUNK_FACTOR, !!this.rivers.get(i)));
                }
            }
        }
        for (const [k, river] of this.rivers) {
            if (!river)
                continue;
            if (Math.abs(Math.floor(river.y / MapMaker.VERTICAL_CHUNK_FACTOR) - cy) > 2) {
                river.destruct();
            }
            this.rivers.delete(k);
        }
        this.prevcx = cx;
        this.prevcy = cy;
    }
    collision(otherObject, subObject) {
    }
}
MapMaker.VERTICAL_CHUNK_FACTOR = 800;
MapMaker.HORIZONTAL_CHUNK_FACTOR = 600;
