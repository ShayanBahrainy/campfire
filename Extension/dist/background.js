export class Background {
    constructor(renderer) {
        this.renderer = renderer;
        this.priority = 0;
        this.shape = "none";
        this.x = 0;
        this.y = 0;
        this.fillStyle = "";
        this.renderparts = [
            //Sky
            ...[
                { shape: "rectangle", x: 0, y: 0, priority: -100, fillStyle: "rgba(2, 2, 110, 1)", width: this.renderer.canvas.width, height: this.renderer.canvas.height, nocollide: true, screenpositioning: true },
            ]
        ];
        this.renderer.addObject(this);
        this.prevWidth = this.renderer.canvas.width;
        this.prevHeight = this.renderer.canvas.height;
    }
    update() {
        if (this.renderer.canvas.width != this.prevWidth || this.renderer.canvas.height != this.prevHeight) {
            this.renderparts = [
                //Sky
                ...[
                    { shape: "rectangle", x: 0, y: 0, priority: -100, fillStyle: "rgba(2, 2, 110, 1)", width: this.renderer.canvas.width, height: this.renderer.canvas.height, nocollide: true, screenpositioning: true },
                ]
            ];
            this.prevHeight = this.renderer.canvas.height;
            this.prevWidth = this.renderer.canvas.width;
        }
    }
    collision(otherObject) {
    }
}
