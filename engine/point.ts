import { Vector } from "./vector";

export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(vector: Vector): Point;
    add(point: Point): Point;

    add(something: Point | Vector): Point {
        return new Point(this.x + something.x, this.y + something.y);
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