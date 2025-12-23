import { Renderable } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js"
import { Shape } from "./engine/shape.js";

class Player implements Renderable {
    x: number;
    y: number;
    priority: number;
    fillStyle: string;
    shape: Shape;

    width: number;
    height: number;


    constructor() {
        this.x = 0;
        this.y = 0;
        this.priority = 2;
        this.fillStyle = "rgb(255, 0, 255)";
        this.shape = "rectangle";

        this.width = 10;
        this.height = 10;

    }

    update() {

    }

    collision(otherObject: Renderable): void {

    }

    handleEvent(ev: KeyboardEvent) {
        if (ev.type != "keypress") return;

        if (ev.key == "w") {
            this.y -= 10;
        }

        if (ev.key == "s") {
            this.y += 10;
        }

        if (ev.key == "a") {
            this.x -= 10;
        }

        if (ev.key == "d") {
            this.x += 10;
        }
    }
}

window.addEventListener("DOMContentLoaded", function () {
    let renderer: Renderer = new Renderer();

    let player = new Player();

    renderer.addObject(player)
    renderer.addObject({collision:function(){}, update:function(){}, x: 500, y: 500, shape:"rectangle", fillStyle:"rgb(255,255,255)", priority:0, text:"Hello World"  })

    this.window.addEventListener("keypress", player)

})