import { RecieveKeyPress } from "./engine/recievekeypress.js";
import { BaseRenderable, CircleRenderable, SubObject } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js";
import { Ember } from "./chunk.js";

export class Snowball implements CircleRenderable, RecieveKeyPress {

    private vx: number;
    private vy: number;

    shape: "circle";
    priority: number;
    fillStyle: string;

    renderer: Renderer;

    radius: number;
    angle: number;

    nocollide: boolean;

    text?: string;

    renderparts?: SubObject[];

    isplayer?: boolean;

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

        this.isplayer = isplayer;
    }

    update(): void {
        this.vx = Math.min(10, this.vx);
        this.vx = Math.max(-10, this.vx);

        this.x += this.vx;
        this.y += this.vy;

        if (this.isplayer) {
            this.renderparts = [{x:20, y:0, text: (Math.floor(this.y / 1000) * 1000).toString(), shape: "rectangle", width: 0, height: 0, fillStyle: "rgb(255, 255, 255)", priority: 5, screenpositioning: true}];
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

    collision(otherObject: BaseRenderable, subObject?: SubObject): void {
        if (otherObject instanceof Snowball) return;
        if (subObject && subObject instanceof Ember && subObject.burnt) return;

        this.nocollide = true;
        this.vx = 0;
        this.vy = 0;
    }

    handleEvent(this: Snowball, ev: KeyboardEvent): void {
        if (!this.isplayer) return;

        if (this.nocollide) return;

        if (!this.isplayer) return;

        if (ev.key == "ArrowLeft") {
            this.vx -= 1;
        }

        if (ev.key == "ArrowRight") {
            this.vx += 1;
        }
    }
}