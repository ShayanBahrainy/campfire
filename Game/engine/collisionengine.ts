import { BaseRenderable, CircleRenderable, LineRenderable, PolygonRenderable, RectangleRenderable, SubObject, isSubObject } from "./renderable.js";
import { Renderer } from "./renderer.js";
import { Point } from "./point.js";
import { LineInert } from "./line.js";
import { Vector } from "./vector.js";

export class CollisionEngine {
    public readonly MAP_FACTOR: number;

    constructor(mapFactor: number) {
        this.MAP_FACTOR = mapFactor;
    }

    private static closestVertexToCircle(object: BaseRenderable | SubObject, circle: CircleRenderable) {
        let points: Point[]
        let circleCenter: Point = new Point(circle.x, circle.y);

        if (object.shape == "rectangle") {
            const rectangle = object as RectangleRenderable;
            points = Renderer.getRectanglePoints(rectangle);
        }

        if (object.shape == "polygon") {
            const polygon = object as PolygonRenderable;
            points = Renderer.calculatePoints(polygon.vertexes, polygon.apothem, object.x, object.y, object.rotation ? object.rotation : 0);
        }

        let minPoint: Point = points[0];
        let minDistance: number = points[0].distance(circleCenter) - circle.radius;

        for (let point of points) {
            if (point.distance(circleCenter) - circle.radius < minDistance) {
                minPoint = point;
            }
        }

        return minPoint;
    }

    private static getAxes(object: BaseRenderable | SubObject, otherShape?: BaseRenderable | SubObject): Vector[] {
        let segments: LineInert[] = []

        let axes: Vector[] = []

        if (object.shape == "rectangle") {
            const rectangle = object as RectangleRenderable;
            let points: Point[] = Renderer.getRectanglePoints(rectangle);

            segments.push(new LineInert(points[points.length - 1], points[0]));
            for (let i = 1; i < points.length; i++) {
                segments.push(new LineInert(points[i - 1], points[i]));
            }

        }

        if (object.shape == "circle" && otherShape && otherShape.shape != "circle") {
            const circle = object as CircleRenderable;
            axes.push(Vector.fromPoints(new Point(object.x, object.y), CollisionEngine.closestVertexToCircle(otherShape, circle)));
        }

        if (object.shape == "polygon") {
            const polygon = object as PolygonRenderable;
            let points: Point[] = Renderer.calculatePoints(polygon.vertexes, polygon.apothem, object.x, object.y, object.rotation);

            segments.push(new LineInert(points[points.length - 1], points[0]));
            for (let i = 1; i < points.length; i++) {
                segments.push(new LineInert(points[i - 1], points[i]));
            }

        }

        if (object.shape == "line") {
            ;
        }

        for (const segment of segments) {
                const dy = segment.end.y - segment.start.y;
                const dx = segment.end.x - segment.start.x;

                axes.push(Vector.fromPoints(new Point(segment.start.x, segment.start.y), new Point(segment.start.x - dy, segment.start.y + dx)));
        }

        //Normalize to unit vector
        axes = axes.map((vector) => vector.normalize());

        return axes;
    }

    SAT(first: BaseRenderable | SubObject, second: BaseRenderable | SubObject): boolean {
        if (first.shape == "none" || second.shape == "none") {
            return false;
        }

        if (first.shape == "line" || second.shape == "line") {
            return false;
        }

        if (first.shape == "circle" && second.shape == "circle") {
            const circle_one = first as CircleRenderable;
            const circle_second = second as CircleRenderable;

            return Math.sqrt(Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2)) < circle_one.radius + circle_second.radius;
        }

        let axes: Vector[] = []

        axes.push(...CollisionEngine.getAxes(first, second));

        axes.push(...CollisionEngine.getAxes(second, first));

        for (const axis of axes) {
            const firstProjection = new MinMaxProjection(first, axis);
            const secondProjection = new MinMaxProjection(second, axis);
            if (firstProjection.max < secondProjection.min || secondProjection.max < firstProjection.min) {
                return false;
            }
        }

        return true;
    }

    SpatialMap(objects: (BaseRenderable | SubObject)[]): (BaseRenderable | SubObject)[][][] {
        let SpatialMap: (BaseRenderable | SubObject)[][][] = []

        for (let object of objects){
            if (object.nocollide) {
                continue;
            }

            let X = Math.floor(object.x/this.MAP_FACTOR)
            if (SpatialMap[X] == null) {
                SpatialMap[X] = [];
            }

            let Y = Math.floor(object.y/this.MAP_FACTOR)
            if (SpatialMap[X][Y] == null) {
                SpatialMap[X][Y] = [];
            }

            SpatialMap[X][Y].push(object);
        }

        return SpatialMap;
    }
}


class MinMaxProjection {

    public min: number;
    public max: number;

    constructor(object: BaseRenderable | SubObject, axis: Vector) {
        this.max = -Infinity;
        this.min = Infinity;

        let points: Point[]

        switch (object.shape) {
            case "none":
                console.error(object);
                throw new Error("Attempt to project object with no shape!");

            case "polygon":
                const polygon = object as PolygonRenderable;
                points = Renderer.calculatePoints(polygon.vertexes, polygon.apothem, object.x, object.y, object.rotation ? object.rotation : 0);

                for (let point of points) {
                    const projection = (point.x * axis.x + point.y * axis.y);

                    this.min = Math.min(projection, this.min);

                    this.max = Math.max(projection, this.max);
                }
                break;

            case "line":
                const line = object as LineRenderable;

                const startProjection = (object.x * axis.x) + (object.y * axis.y)
                const endProjection = (line.end.x * axis.x) + (line.end.y * axis.y);

                this.min = Math.min(startProjection, endProjection);
                this.max = Math.max(startProjection, endProjection);
                break;

            case "circle":
                const circle = object as CircleRenderable;

                const centerProjection = circle.x * axis.x + circle.y * axis.y;

                this.min = centerProjection - circle.radius;
                this.max = centerProjection + circle.radius;
                break;

            case "rectangle":
                const rectangle = object as RectangleRenderable;

                let origin = new Point(object.x + rectangle.width/2, object.y + rectangle.height/2);

                points = [new Point(object.x - origin.x, object.y - origin.y), new Point(object.x + rectangle.width - origin.x, object.y - origin.y), new Point(object.x + rectangle.width - origin.x, object.y + rectangle.height - origin.y), new Point(object.x - origin.x, object.y + rectangle.height - origin.y)];


                points = Renderer.getRectanglePoints(rectangle);

                for (let point of points) {
                    const projection = (point.x * axis.x + point.y * axis.y);

                    this.min = Math.min(projection, this.min);
                    this.max = Math.max(projection, this.max);
                }

                break;
        }
    }

}