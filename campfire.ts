import { Renderable } from "./engine/renderable.js";
import { Renderer } from "./engine/renderer.js"
import { Shape } from "./engine/shape.js";

import { Player } from "./player.js";
import { Background } from "./background.js";


window.addEventListener("DOMContentLoaded", function () {
    let renderer: Renderer = new Renderer();

    //let player = new Player(0, 0, renderer);

    //renderer.addObject(player);
    //renderer.addObject({collision:function(){}, update:function(){}, x: 500, y: 500, shape:"rectangle", fillStyle:"rgb(255,255,255)", priority:0, text:"Hello World"  });

    renderer.addObject(new Background(renderer));

})