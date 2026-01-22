import { BaseRenderable, NoneRenderable, RectangleRenderable, SubObject } from "./engine/renderable.js";
import { MapMaker } from "./map.js";
import { Renderer } from "./engine/renderer.js";
import { Point } from "./engine/point.js";
import { Shape } from "./engine/shape.js";

export class River implements NoneRenderable {
    static readonly RIVER_HEIGHT = 200;
    static readonly RIVER_SPEED = -5;
    shape: "none";

    fillStyle: string;

    priority: number;

    renderparts: SubObject[];

    lines: SubObject[];
    riverparts: SubObject[];

    linetimer: number;
    readonly linetime: number;

    prevcx: number;
    prevcy: number;

    line_y: number;
    delta_line_y: number;

    constructor(public x: number, public y: number, public renderer: Renderer) {
        renderer.addObject(this);

        this.shape = "none";
        this.fillStyle = "rgb(78, 78, 168)";

        this.renderparts = [];
        this.lines = [];
        this.riverparts = [];

        this.priority = 0;

        this.linetime = 30;
        this.linetimer = this.linetime;

        const follow_point = this.renderer.getFollowPoint();

        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR) * MapMaker.VERTICAL_CHUNK_FACTOR;

        this.line_y = cy + 110;
        this.delta_line_y = 50;

        this.prevcx = Infinity;
        this.prevcy = Infinity;

        this.buildHistory();
    }

    /**
     * Builds a history of line for when the river just spawns in
     */
    buildHistory() {
        const follow_point = this.renderer.getFollowPoint();
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR) * MapMaker.VERTICAL_CHUNK_FACTOR;

        for (let x = follow_point.x - this.renderer.canvas.width/2; x < follow_point.x + this.renderer.canvas.width/2; x += Math.abs(River.RIVER_SPEED * this.linetime)) {
            const start_point = new Point(x, this.line_y);
            const end_point = new Point(start_point.x + 200, this.line_y);
            this.lines.push({x: start_point.x, y: start_point.y, end: end_point, shape: "line" as Shape, priority: 2, fillStyle: "rgb(255,255,255)"});

            if (this.line_y + this.delta_line_y > (cy + 100) + River.RIVER_HEIGHT || this.line_y + this.delta_line_y < (cy + 100) ) this.delta_line_y *= -1;

            this.line_y += this.delta_line_y;
        }

    }

    addRiverParts() {
        const follow_point = this.renderer.getFollowPoint();

        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR) * MapMaker.VERTICAL_CHUNK_FACTOR;

        if (cx == this.prevcx && cy == this.prevcy) {
            return;
        }

        this.riverparts = [];

        for (let x = cx - (MapMaker.HORIZONTAL_CHUNK_FACTOR * 2); x < cx + (MapMaker.HORIZONTAL_CHUNK_FACTOR * 3); x += MapMaker.HORIZONTAL_CHUNK_FACTOR) {
            this.riverparts.push({x: x, y: cy + 100, shape: "rectangle" as Shape, priority: 1, fillStyle: this.fillStyle, width: MapMaker.HORIZONTAL_CHUNK_FACTOR + 2, height: River.RIVER_HEIGHT });
        }

        this.prevcx = cx;
        this.prevcy = cy;
    }

    update(): void {
        const follow_point = this.renderer.getFollowPoint();

        const cx = Math.floor(follow_point.x / MapMaker.HORIZONTAL_CHUNK_FACTOR) * MapMaker.HORIZONTAL_CHUNK_FACTOR;
        const cy = Math.floor(follow_point.y / MapMaker.VERTICAL_CHUNK_FACTOR) * MapMaker.VERTICAL_CHUNK_FACTOR;

        this.addRiverParts();

        if (this.linetimer == 0) {
            const start_point = new Point(cx + 1000, this.line_y);
            const end_point = new Point(start_point.x - 200, this.line_y);
            this.lines.push({x: start_point.x, y: start_point.y, end: end_point, shape: "line" as Shape, priority: 2, fillStyle: "rgb(255,255,255)"});

            this.linetimer = this.linetime;

            if (this.line_y + this.delta_line_y > (cy + 100) + River.RIVER_HEIGHT || this.line_y + this.delta_line_y < (cy + 100) ) this.delta_line_y *= -1;

            this.line_y += this.delta_line_y;
        }
        else {
            this.linetimer -= 1;
            for (let i = 0; i < this.lines.length; i++) {
                const subObject = this.lines[i];
                if (Math.abs(subObject.x - cx) > this.renderer.canvas.width) {
                    this.lines.splice(i, 1);
                }

                subObject.x += River.RIVER_SPEED;
                if (subObject.end) {
                    subObject.end.x += River.RIVER_SPEED;
                }
            }
        }

        this.renderparts = [...this.lines, ...this.riverparts];
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject, childObject?: SubObject): void {

    }
}