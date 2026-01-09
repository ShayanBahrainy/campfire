import { BaseRenderable } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js"
import { Shape } from "./engine/shape.js";

import { Player } from "./player.js";
import { Background } from "./background.js";
import { Snowball } from "./snowball.js";


function createMarshmallow(renderer: Renderer): void {
    new Snowball(Math.random() * 1000, 50, renderer);
}

window.addEventListener("DOMContentLoaded", function () {
    let renderer: Renderer = new Renderer();

    //let player = new Player(0, 0, renderer);

    //renderer.addObject(player);
    //renderer.addObject({collision:function(){}, update:function(){}, x: 500, y: 500, shape:"rectangle", fillStyle:"rgb(255,255,255)", priority:0, text:"Hello World"  });

    new Background(renderer);

    createMarshmallow(renderer);
    this.setInterval(createMarshmallow, 100, renderer);

})