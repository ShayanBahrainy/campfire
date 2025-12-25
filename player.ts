import { Renderable } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js"
import { Shape } from "./engine/shape.js";
import { RecieveKeyPress } from "./engine/recievekeypress.js";

export class Player implements Renderable, RecieveKeyPress {
    priority: number;
    shape: Shape;
    fillStyle: string;

    width: number;
    height: number;

    constructor(public x: number, public y: number, renderer: Renderer) {
        renderer.addObject(this);
        this.shape = "rectangle";
        this.fillStyle = "rgb(255, 0, 0);"
        this.priority = 0;
        this.width = 10;
        this.height = 10;
    }

    update(): void {

    }

    collision(otherObject: Renderable): void {

    }

    handleEvent(ev: KeyboardEvent): void {
        const SPEED = 10;
        if (ev.key == "w") {
            this.y -= SPEED;
        }

        if (ev.key == "s") {
            this.y += SPEED;
        }

        if (ev.key == "a") {
            this.x -= SPEED;
        }

        if (ev.key == "d") {
            this.x += SPEED;
        }

    }
}