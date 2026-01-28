export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v_prime) {
        return new Vector(this.x + v_prime.x, this.y + v_prime.y);
    }
    static fromPoints(point1, point2) {
        return new Vector(point1.x - point2.x, point1.y - point2.y);
    }
    static fromLine(line) {
        return new Vector(line.end.x - line.start.x, line.end.y - line.start.y);
    }
    multiply(n) {
        return new Vector(this.x * n, this.y * n);
    }
    normalize() {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        if (magnitude == 0) {
            return new Vector(0, 0);
        }
        return new Vector(this.x / magnitude, this.y / magnitude);
    }
}
