import { Ember } from "./chunk.js";
import { Point } from "./engine/point.js";
import { Vector } from "./engine/vector.js";
import { Icicle } from "./chunk.js";
import { River } from "./river.js";
class Shard {
    updatePosition(angle, current_point) {
        angle = angle * Math.PI / 180;
        const position_delta = this.starting_pos.distance(current_point);
        const offset_distance = position_delta * Math.tan(angle);
        const segmentVector = Vector.fromPoints(this.starting_pos, current_point);
        const offset = (this.side == 1 ? new Vector(-segmentVector.y, segmentVector.x) : new Vector(segmentVector.y, -segmentVector.x)).normalize().multiply(offset_distance);
        const shard_pos = current_point.add(offset);
        this.x = shard_pos.x;
        this.y = shard_pos.y;
    }
    constructor(x, y, priority, fillStyle, side) {
        this.x = x;
        this.y = y;
        this.starting_pos = new Point(this.x, this.y);
        this.priority = priority;
        this.fillStyle = fillStyle;
        this.shape = "polygon";
        this.vertexes = 3;
        this.apothem = 10;
        this.keepMoving = true;
        this.side = side;
    }
}
export class Snowball {
    constructor(x, y, renderer, isplayer) {
        this.x = x;
        this.y = y;
        renderer.addObject(this);
        this.shape = "circle";
        this.vx = Snowball.HORIZONTAL_SPEED;
        this.vy = Snowball.VERTICAL_SPEED;
        this.fillStyle = "rgb(255,255,255)";
        this.priority = 10;
        this.renderer = renderer;
        this.radius = 10;
        this.angle = 360;
        this.nocollide = false;
        this.shattered = false;
        this.isplayer = isplayer;
        this.mounted = false;
    }
    update() {
        this.vx = Math.min(10, this.vx);
        this.vx = Math.max(-10, this.vx);
        this.x += this.vx;
        this.y += this.vy;
        this.renderparts = [];
        if (this.isplayer) {
            this.renderparts.push(...[{ x: 20, y: 0, text: (Math.floor(this.y / 1000) * 1000).toString(), shape: "rectangle", width: 0, height: 0, fillStyle: "rgb(255, 255, 255)", priority: 5, screenpositioning: true }]);
        }
        if (this.shattered && this.shards) {
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
    setVelocity(vx, vy) {
        if (vx != Infinity) {
            this.vx = vx;
        }
        if (vy != Infinity) {
            this.vy = vy;
        }
    }
    toggleMount() {
        //Either way jump down, but jump down more to add a small distance between river and snowball to prevent remounting
        if (!this.mounted) {
            this.y += River.RIVER_HEIGHT / 2;
            this.vy = 0;
            this.vx = River.RIVER_SPEED;
        }
        else {
            this.y += River.RIVER_HEIGHT / 2 + (this.radius * 2 + 1);
            this.vy = Snowball.VERTICAL_SPEED;
            this.vx = Snowball.HORIZONTAL_SPEED;
        }
        this.mounted = !this.mounted;
    }
    collision(otherObject, subObject, childObject) {
        //No collisions with other snowballs, burnt embers, and shards with embers or wih icicles, or with rivers when mounted
        if (otherObject instanceof Snowball)
            return;
        if (subObject && subObject instanceof Ember && subObject.burnt)
            return;
        if (subObject && subObject instanceof Ember && childObject && childObject instanceof Shard)
            return;
        if (subObject && subObject instanceof Icicle && childObject && childObject instanceof Shard)
            return;
        if (otherObject instanceof River && this.mounted)
            return;
        if (subObject && (subObject instanceof Ember || subObject instanceof Icicle) && !(childObject instanceof Shard)) {
            this.shape = "none";
            this.shattered = true;
            this.shards = [new Shard(this.x, this.y, 2, "rgb(255,255,255)", 1), new Shard(this.x, this.y, 2, "rgb(255,255,255)", 0)];
            this.nocollide = true;
            return;
        }
        if (!(subObject && subObject instanceof Ember) && childObject && childObject instanceof Shard && this.shards) {
            childObject.keepMoving = false;
            let allStopped = true;
            for (const shard of this.shards) {
                if (shard.keepMoving) {
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
            this.toggleMount();
            return;
        }
        this.vx = 0;
        this.vy = 0;
    }
    handleEvent(ev) {
        if (!this.isplayer)
            return;
        if (this.nocollide)
            return;
        if (!this.isplayer)
            return;
        if (["A", "a", "ArrowLeft"].indexOf(ev.key) > -1 && !this.mounted) {
            this.vx -= 1;
        }
        if (["D", "d", "ArrowRight"].indexOf(ev.key) > -1 && !this.mounted) {
            this.vx += 1;
        }
        if (["S", "s", "ArrowDown"].indexOf(ev.key) > -1 && this.mounted) {
            this.toggleMount();
        }
    }
}
Snowball.VERTICAL_SPEED = 2;
Snowball.HORIZONTAL_SPEED = 0.1;
