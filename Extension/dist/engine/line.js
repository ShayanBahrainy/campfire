export class LineInert {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}
export class Line {
    constructor(start, end, width, renderer) {
        renderer.addObject(this);
        this.x = start.x;
        this.y = start.y;
        this.end = end;
        this.width = width;
        this.shape = "line";
        this.width = width;
        this.priority = 0;
        this.fillStyle = "rgb(255, 255, 255)";
    }
    update() {
    }
    collision() {
    }
}
