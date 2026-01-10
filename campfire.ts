import { Renderer } from "./engine/renderer.js"

import { Background } from "./background.js";
import { Snowball } from "./snowball.js";

import { Map } from "./map.js";




window.addEventListener("DOMContentLoaded", function () {
    let renderer: Renderer = new Renderer();
    new Background(renderer);

    new Map(renderer);

    const snowball = new Snowball(renderer.canvas.width / 2, 0, renderer);

    renderer.cameraFollow(snowball);

})