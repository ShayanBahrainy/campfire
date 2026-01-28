import { Point } from "./point.js";
import { LineInert } from "./line.js";

export class Vector {
    constructor(public x: number, public y: number) {

    }

    add(v_prime: Vector) {
        return new Vector(this.x + v_prime.x, this.y + v_prime.y);
    }

    static fromPoints(point1: Point, point2: Point) {
        return new Vector(point1.x - point2.x, point1.y - point2.y);
    }

    static fromLine(line: LineInert) {
        return new Vector(line.end.x - line.start.x, line.end.y - line.start.y);
    }

    multiply(n: number) {
        return new Vector(this.x * n, this.y * n);
    }

    normalize(): Vector {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

        if (magnitude == 0) {
            return new Vector(0, 0);
        }

        return new Vector(this.x/magnitude, this.y/magnitude);
    }
}