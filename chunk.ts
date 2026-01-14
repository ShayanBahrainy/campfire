import { BaseRenderable, NoneRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Shape } from "./engine/shape.js";

interface Ember extends SubObject {
    vibration?: number;
}

export class Chunk implements NoneRenderable {
    x: number;
    y: number;

    priority: number;

    fillStyle: string;

    shape: "none";

    trees: SubObject[][];

    campfires: SubObject[][];

    embers: Ember[][];

    renderer: Renderer;

    renderparts?: SubObject[];

    private generateChunk(x: number, y: number, width: number): void {
        let generateFloat: (a: number, b: number) => number = this.renderer.generateFloat.bind(this.renderer);

        for (let i = Math.floor(x / 400) * 400 + 175; i < width + x; i += 400) {
            if (this.renderer.generateRandom(i, y) % 6 == 0) continue;

            let campfire: SubObject[] = [
                {x: i + 25, y: y - 15, apothem: 45, shape: "polygon" as Shape, vertexes: 3, fillStyle: "rgba(250, 162, 0, 1)", priority: 1, rotation: 90},
                {x: i, y: y, radius: 15.5, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: -220},
                {x: i + 24, y: y, radius: 15.5, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: 235},
                {x: i + 50, y: y, radius: 15.5, priority: 2, shape: "circle" as Shape, fillStyle: "rgb(77, 52, 16)", rotation: 235},
            ];

            //Generate embers
            if (this.renderer.generateFloat(i, y) < 0.25) {
                const ember_count = Math.floor(Math.random() * 6);

                const v_signs: number[] = [];
                for (let j = 0; j < ember_count; j++) v_signs.push(Math.random() > 0.5 ? 1 : -1);

                let embers: Ember[] = [];

                for (let j = 0; j < ember_count; j++){
                    embers.push({x: i + generateFloat(i, y) * 10, y: y - 150 + Math.random() * 75, radius: 3, shape: "circle" as Shape, vertexes: 3, fillStyle: "rgba(231, 185, 100, 1)", angle: 360, priority: 2, vibration: generateFloat(i + j, y) * 5 * v_signs[j] } as Ember)
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
                {x: i - 20, y: y - 200, height: 200, width: 20, priority: 1, shape: "rectangle" as Shape, fillStyle: "rgb(93, 52, 0)"},
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

        this.generateChunk(x, y, width);
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

        for (const ember of this.embers) {
            for (const subObject of ember) {
                subObject.y -= 1;
                subObject.x -= subObject.vibration * Math.cos(subObject.y / 10);
            }
        }
    }


    destruct(): void {
        delete this.renderparts;
        delete this.campfires;
        delete this.embers;
        delete this.trees;

        this.renderer.removeObject(this);
    }

    collision(otherObject: BaseRenderable, subObject?: SubObject): void {

    }


}