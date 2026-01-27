import { Point } from "./engine/point.js";
import { BaseRenderable, NoneRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Shape } from "./engine/shape.js";
import { MapMaker } from "./map.js";
import { Vector } from "./engine/vector.js";
import { Snowball } from "./snowball.js";

export class Ember implements SubObject {
    kind: string;
    angle: number;
    shape: Shape;

    constructor(public x: number, public y: number, public radius: number, public priority: number, public fillStyle: string, public burnt: boolean, public vibration: number, public firePosition: Point) {
        this.kind = "ember";
        this.angle = 360;
        this.shape = "circle" as Shape;
    }
}

export class Icicle implements SubObject {
    x: number;
    y: number;

    vertexes: number;
    apothem: number;
    priority: number;
    fillStyle: string;

    shape: Shape;

    step: number;

    h: number;
    k: number;

    a: number;

    stopped: boolean;

    constructor(starting_point: Point, parabola: Parabola, direction: number) {
        this.x = starting_point.x;
        this.y = starting_point.y;

        this.stopped = false;

        this.shape = "polygon";

        this.vertexes = 6;
        this.apothem = 15;

        this.fillStyle = "rgba(137, 137, 235, 1)";

        this.priority = 3;

        this.h = parabola.h;
        this.k = parabola.k;

        this.a = parabola.a;

        this.step = direction;

    }

    updatePosition() {
        if (this.stopped) return;

        this.x = this.x + this.step;

        this.y = this.a * Math.pow(this.x - this.h,2) + this.k;
    }


}

export class Chunk implements NoneRenderable {
    static readonly CHUNK_HEIGHT = 330;

    x: number;
    y: number;

    priority: number;

    fillStyle: string;

    shape: "none";

    trees: SubObject[][];

    campfires: SubObject[][];

    icicles: Icicle[];

    embers: Ember[][];

    renderer: Renderer;

    renderparts?: SubObject[];

    has_fired: boolean;

    private generateChunk(x: number, y: number, width: number): void {
        let generateFloat: (a: number, b: number) => number = this.renderer.generateFloat.bind(this.renderer);

        for (let i = Math.floor(x / 400) * 400 + 175; i < width + x; i += 400) {
            if (this.renderer.generateRandom(i, y) % 6 == 0) continue;

            let campfire: SubObject[] = [
                {x: i + 25, y: y - 15, apothem: 22, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(250, 162, 0, 1)", priority: 1, rotation: 90},
                {x: i, y: y, radius: 7, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: -220},
                {x: i + 24, y: y, radius: 7, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: 235},
                {x: i + 50, y: y, radius: 7, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: 235},
            ];

            //Generate embers
            if (this.renderer.generateFloat(i, y) > 0.25) {
                const ember_count = Math.floor(Math.random() * 6);

                const v_signs: number[] = [];
                for (let j = 0; j < ember_count; j++) v_signs.push(Math.random() > 0.5 ? 1 : -1);

                let embers: Ember[] = [];

                for (let j = 0; j < ember_count; j++){
                    const isBurnt = Math.random() > 0.5;
                    embers.push(new Ember(i + generateFloat(i, y) * 10, y - 150 + Math.random() * 75, 4, 2, isBurnt ? "rgba(85, 78, 78, 1)": "rgba(231, 185, 100, 1)", isBurnt, generateFloat(i + j, y) * 5 * v_signs[j], new Point(i, y)));
                }

                this.embers.push(
                    embers
                );
            }

            this.campfires.push(
                campfire
            );
        }

        for (let i = Math.floor(x / 400) * 400; i < width + x; i += 400) {
            let tree: SubObject[] = [
                //Stem of tree is unreachable, so don't do collisions to optimize
                {x: i - 20, y: y - 200, height: 200, width: 20, priority: 0, shape: "rectangle" as Shape, fillStyle: "rgb(93, 52, 0)", nocollide: true},
                {x: i - 5, y: y - 240, apothem: 90, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 180, apothem: 120, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90},
                {x: i - 5, y: y - 100, apothem: 150, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(23, 86, 23, 1)", priority: 2, rotation: 90}
            ]
            this.trees.push(tree)
        }
    }


    constructor(renderer: Renderer, x: number, y: number, width: number) {
        renderer.addObject(this);
        this.renderer = renderer;

        this.campfires = [];
        this.embers = [];
        this.trees = [];
        this.icicles = [];

        this.has_fired = false;

        this.x = x;
        this.y = y;

        this.shape = "none";

        this.generateChunk(x, y, width);
    }

    inChunk(point: Point): boolean {
        const LAYER_HEIGHT = MapMaker.VERTICAL_CHUNK_FACTOR;

        const LAYER_WIDTH = MapMaker.HORIZONTAL_CHUNK_FACTOR;

        return (point.x < this.x + LAYER_WIDTH && point.x >= this.x) && (point.y <= this.y && point.y > this.y - LAYER_HEIGHT);

    }

    isHalfWay(point: Point): boolean {
        const CHUNK_HEIGHT = Chunk.CHUNK_HEIGHT;
        const LAYER_HEIGHT = MapMaker.VERTICAL_CHUNK_FACTOR;

        if (point.y > this.y - CHUNK_HEIGHT  || point.y < this.y - LAYER_HEIGHT) return false;
        if (Math.abs((this.y - CHUNK_HEIGHT - (LAYER_HEIGHT - CHUNK_HEIGHT)/2) - point.y) > 150) return false;

        return true;
    }

    update(): void {
        this.renderparts = [];

        for (const campfire of this.campfires) {
            this.renderparts.push(...campfire);
        }

        for (const ember of this.embers) {
            this.renderparts.push(...ember);
        }

        for (const tree of this.trees) {
            this.renderparts.push(...tree);
        }

        for (const projectile of this.icicles) {
            this.renderparts.push(projectile)
        }

        for (const ember of this.embers) {
            for (const subObject of ember) {
                if (Math.abs(subObject.firePosition.y - subObject.y) > 400) {
                    subObject.y = subObject.firePosition.y - 150 + Math.random() * 75;
                }
                subObject.y -= this.renderer.generateFloat(subObject.firePosition.y, subObject.y) * 1 + 0.5;
                subObject.x -= subObject.vibration * Math.cos(subObject.y / 10);
            }
        }

        for (const projectile of this.icicles) {
            projectile.updatePosition();
        }

        const follow_point = this.renderer.getFollowPoint();

        if (this.inChunk(follow_point) && this.isHalfWay(follow_point) && !this.has_fired) {
            const screen_edge = follow_point.add(new Vector(this.renderer.getCanvas().width/2, 200));

            //Only create the icicle if it's not too low.
            if (this.isHalfWay(screen_edge)) {
                this.has_fired = true;

                const icicle = new Icicle(screen_edge, Chunk.getParabola(follow_point.add(new Vector(0, this.renderer.fps * 3)), screen_edge), -10);

                this.icicles.push(icicle);
            }
        }
    }

    /** Removes Chunk from render queue, and cleans up all associated objects. */
    destruct(): void {
        this.renderparts = null;
        this.campfires = null;
        this.embers = null;
        this.trees = null;

        this.renderer.removeObject(this);
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject, childObject?: SubObject): void {
        if (childObject && childObject instanceof Icicle && !(otherObject instanceof Snowball || otherObject instanceof Icicle)) {
            childObject.stopped = true;
        }
    }

    /**
     * @param point_one
     * @param point_two
     */
    static getParabola(point_one: Point, point_two: Point): Parabola {
        const parabola = {h: point_one.x, k: point_one.y, a: Infinity};

        parabola.a = (-parabola.k + point_two.y) / Math.pow(point_two.x - parabola.h, 2);

        return parabola;
    }


}

interface Parabola {
    h: number;
    k: number;
    a: number;
}