import { Renderer } from "./engine/renderer.js"

import { Background } from "./background.js";
import { Snowball } from "./snowball.js";

import { MapMaker } from "./map.js";
import { River } from "./river.js";




window.addEventListener("DOMContentLoaded", function () {
    let renderer: Renderer = new Renderer();
    new Background(renderer);

    new MapMaker(renderer);

    const player_snowball = new Snowball(renderer.canvas.width / 2, 0, renderer, true);

    renderer.cameraFollow(player_snowball);
})