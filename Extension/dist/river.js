import { MapMaker } from "./map.js";
import { Point } from "./engine/point.js";
export class River {
    constructor(y, renderer) {
        this.renderer = renderer;
        renderer.addObject(this);
        this.shape = "none";
        this.fillStyle = "rgb(78, 78, 168)";
        this.renderparts = [];
        this.lines = [];
        this.riverparts = [];
        this.priority = 0;
        this.linetime = 30;
        this.linetimer = this.linetime;
        this.y = y;
        this.x = -Infinity;
        this.line_y = this.y + 110;
        this.delta_line_y = 50;
        this.add_new_lines = true;
        this.prevcx = Infinity;
        this.prevcy = Infinity;
        this.buildHistory();
    }
    /**
     * Builds a history of lines for when the river just spawns in
     */
    buildHistory() {
        const follow_point = this.renderer.getFollowPoint();
        const cy = this.y;
        for (let x = follow_point.x - MapMaker.HORIZONTAL_CHUNK_FACTOR * 2; x < follow_point.x + MapMaker.HORIZONTAL_CHUNK_FACTOR * 2; x += Math.abs(River.RIVER_SPEED * this.linetime)) {
            const start_point = new Point(x, this.line_y);
            const end_point = new Point(start_point.x + 200, this.line_y);
            this.lines.push({ x: start_point.x, y: start_point.y, end: end_point, shape: "line", priority: 4, fillStyle: "rgb(255,255,255)" });
            if (this.line_y + this.delta_line_y > (cy + 100) + River.RIVER_HEIGHT || this.line_y + this.delta_line_y < (cy + 100))
                this.delta_line_y *= -1;
            this.line_y += this.delta_line_y;
        }
    }
    addRiverParts() {
        const follow_point = this.renderer.getFollowPoint();
        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = this.y;
        if (cx == this.prevcx && cy == this.prevcy) {
            return;
        }
        this.riverparts = [];
        for (let x = cx - (MapMaker.HORIZONTAL_CHUNK_FACTOR * 2); x < cx + (MapMaker.HORIZONTAL_CHUNK_FACTOR * 3); x += MapMaker.HORIZONTAL_CHUNK_FACTOR) {
            this.riverparts.push({ x: x, y: cy + 100, shape: "rectangle", priority: 3, fillStyle: this.fillStyle, width: MapMaker.HORIZONTAL_CHUNK_FACTOR + 2, height: River.RIVER_HEIGHT });
        }
        this.prevcx = cx;
        this.prevcy = cy;
    }
    update() {
        const follow_point = this.renderer.getFollowPoint();
        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = this.y;
        this.addRiverParts();
        if (this.linetimer <= 0 && this.add_new_lines) {
            const start_point = new Point(cx + 1000, this.line_y);
            const end_point = new Point(start_point.x - 200, this.line_y);
            this.lines.push({ x: start_point.x, y: start_point.y, end: end_point, shape: "line", priority: 4, fillStyle: "rgb(255,255,255)" });
            this.linetimer = this.linetime;
            if (this.line_y + this.delta_line_y > (cy + 100) + River.RIVER_HEIGHT || this.line_y + this.delta_line_y < (cy + 100))
                this.delta_line_y *= -1;
            this.line_y += this.delta_line_y;
        }
        this.linetimer -= 1;
        for (let i = 0; i < this.lines.length; i++) {
            const subObject = this.lines[i];
            if (Math.abs(subObject.x - cx) > this.renderer.canvas.width) {
                this.lines.splice(i, 1);
                continue;
            }
            subObject.x += River.RIVER_SPEED;
            if (subObject.end) {
                subObject.end.x += River.RIVER_SPEED;
            }
        }
        this.renderparts = [...this.lines, ...this.riverparts];
    }
    toggleNewLines() {
        this.add_new_lines = !this.add_new_lines;
    }
    collision(otherObject, subObject, childObject) {
    }
    destruct() {
        this.renderer.removeObject(this);
        this.lines = [];
        this.renderparts = [];
    }
}
River.RIVER_HEIGHT = 200;
River.RIVER_SPEED = -5;
