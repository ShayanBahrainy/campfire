import { RecieveKeyPress } from "./engine/recievekeypress.js";
import { BaseRenderable, SubObject } from "./engine/renderable.js";
import { Shape } from "./engine/shape.js";
import { Renderer } from "./engine/renderer.js";
import { Ember } from "./chunk.js";
import { Point } from "./engine/point.js";
import { Vector } from "./engine/vector.js";
import { Icicle } from "./chunk.js";
import { River } from "./river.js";

class Shard implements SubObject {
    x: number;
    y: number;

    priority: number;

    fillStyle: string;

    vertexes: number;

    apothem: number;

    shape: Shape;

    keepMoving: boolean;

    starting_pos: Point;

    side: 1 | 0;

    updatePosition(angle: number, current_point: Point) {
        angle = angle * Math.PI / 180;
        const position_delta = this.starting_pos.distance(current_point);
        const offset_distance = position_delta * Math.tan(angle);

        const segmentVector = Vector.fromPoints(this.starting_pos, current_point);

        const offset = (this.side == 1 ? new Vector(-segmentVector.y, segmentVector.x) : new Vector(segmentVector.y, -segmentVector.x)).normalize().multiply(offset_distance);

        const shard_pos = current_point.add(offset);

        this.x = shard_pos.x;
        this.y = shard_pos.y;
    }

    constructor(x: number, y: number, priority: number, fillStyle: string, side: 1 | 0) {
        this.x = x;
        this.y = y;

        this.starting_pos = new Point(this.x, this.y);

        this.priority = priority;
        this.fillStyle = fillStyle;

        this.shape = "polygon" as Shape;
        this.vertexes = 3;
        this.apothem = 10;

        this.keepMoving = true;

        this.side = side;
    }
}


export class Snowball implements BaseRenderable, RecieveKeyPress {

    private vx: number;
    private vy: number;

    shape: Shape | "none";
    priority: number;
    fillStyle: string;

    renderer: Renderer;

    radius: number;
    angle: number;

    nocollide: boolean;

    text?: string;

    renderparts?: SubObject[];

    isplayer?: boolean;

    shattered?: boolean;
    shards?: Shard[];

    mounted: boolean;

    constructor(public x: number, public y: number, renderer: Renderer, isplayer: boolean) {
        renderer.addObject(this);
        this.shape = "circle";
        this.vx = 0.1;
        this.vy = 2;
        this.fillStyle = "rgb(255,255,255)"
        this.priority = 5;
        this.renderer = renderer;

        this.radius = 10;
        this.angle = 360;

        this.nocollide = false;
        this.shattered = false;
        this.isplayer = isplayer;

        this.mounted = false;
    }

    update(): void {
        this.vx = Math.min(10, this.vx);
        this.vx = Math.max(-10, this.vx);

        this.x += this.vx;
        this.y += this.vy;

        this.renderparts = [];

        if (this.isplayer) {
            this.renderparts.push(...[{x:20, y:0, text: (Math.floor(this.y / 1000) * 1000).toString(), shape: "rectangle" as Shape, width: 0, height: 0, fillStyle: "rgb(255, 255, 255)", priority: 5, screenpositioning: true}]);
        }

        if (this.shattered) {
            for (const shard of this.shards) {
                if (shard.keepMoving) {
                    shard.updatePosition(45, new Point(this.x, this.y));
                }
            }
            this.renderparts.push(...this.shards);
        }
    }

    /**
        Change velocity of snowball, pass `Infinity` to leave an axis untouched.
    */
    setVelocity(vx: number, vy: number) {
        if (vx != Infinity) {
            this.vx = vx;
        }

        if (vy != Infinity) {
            this.vy = vy;
        }
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject, childObject?: SubObject): void {
        //No collisions with other snowballs, burnt embers, and shards with embers or wih icicles, or with rivers when mounted
        if (otherObject instanceof Snowball) return;
        if (subObject && subObject instanceof Ember && subObject.burnt) return;
        if (subObject && subObject instanceof Ember && childObject && childObject instanceof Shard) return;
        if (subObject && subObject instanceof Icicle && childObject && childObject instanceof Shard) return;
        if (otherObject instanceof River && this.mounted) return;

        if (subObject && (subObject instanceof Ember || subObject instanceof Icicle ) && !(childObject instanceof Shard)) {
            this.shape = "none";
            this.shattered = true;
            this.shards = [new Shard(this.x, this.y, 2, "rgb(255,255,255)", 1), new Shard(this.x, this.y, 2, "rgb(255,255,255)", 0)];
            this.nocollide = true;
            return;
        }

        if (!(subObject && subObject instanceof Ember) && childObject && childObject instanceof Shard) {
            childObject.keepMoving = false;

            let allStopped = true;
            for (const shard of this.shards) {
                if (shard.keepMoving){
                        allStopped = false;
                }
            }

            if (allStopped) {
                this.vx = 0;
                this.vy = 0;
            }

            return;
        }

        if (otherObject instanceof River && !(childObject instanceof Shard) && !this.mounted) {
            this.mounted = true;
            this.vy = 0;
            this.vx = River.RIVER_SPEED;
            this.y += River.RIVER_HEIGHT/2;
            return;
        }

        this.vx = 0;
        this.vy = 0;
    }

    handleEvent(this: Snowball, ev: KeyboardEvent): void {
        if (!this.isplayer) return;

        if (this.nocollide) return;

        if (!this.isplayer) return;

        if (this.mounted) return;

        if (ev.key == "ArrowLeft") {
            this.vx -= 1;
        }

        if (ev.key == "ArrowRight") {
            this.vx += 1;
        }
    }
}