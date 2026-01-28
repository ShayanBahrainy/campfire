export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(something) {
        return new Point(this.x + something.x, this.y + something.y);
    }
    lessThan(otherPoint) {
        return this.x < otherPoint.x;
    }
    distance(otherPoint) {
        return Math.sqrt(Math.pow(otherPoint.x - this.x, 2) + Math.pow(otherPoint.y - this.y, 2));
    }
    copy() {
        return new Point(this.x, this.y);
    }
}
