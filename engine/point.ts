export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(point: Point) {
        return new Point(this.x + point.x, this.y + point.y)
    }

    lessThan(otherPoint: Point) {
        return this.x < otherPoint.x
    }

    distance(otherPoint: Point) {
        return Math.sqrt(Math.pow(otherPoint.x - this.x, 2) + Math.pow(otherPoint.y - this.y, 2))
    }

    copy() {
        return new Point(this.x, this.y)
    }
}