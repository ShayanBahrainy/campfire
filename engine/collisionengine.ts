import { BaseRenderable, CircleRenderable, LineRenderable, PolygonRenderable, RectangleRenderable, SubObject, isSubObject } from "./renderable.js";
import { Renderer } from "./renderer.js";
import { Point } from "./point.js";
import { LineInert } from "./line.js";

export class CollisionEngine {
    public readonly MAP_FACTOR: number;

    constructor(mapFactor: number) {
        this.MAP_FACTOR = mapFactor;
    }

    private static getRectanglePoints(rectangle: RectangleRenderable) {
        let points: Point[] = [new Point(rectangle.x, rectangle.y), new Point(rectangle.x + rectangle.width, rectangle.y), new Point(rectangle.x + rectangle.width, rectangle.y + rectangle.height), new Point(rectangle.x, rectangle.y + rectangle.height)];

        return points;
    }

    private static closestVertexToCircle(object: BaseRenderable | SubObject, circle: CircleRenderable) {
        let points: Point[]
        let circleCenter: Point = new Point(circle.x, circle.y);

        if (object.shape == "rectangle") {
            const rectangle = object as RectangleRenderable;
            points = CollisionEngine.getRectanglePoints(rectangle);
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

    private static getAxes(object: BaseRenderable | SubObject, otherShape?: BaseRenderable | SubObject): LineInert[] {
        let segments: LineInert[] = []

        let axes: LineInert[] = []

        if (object.shape == "rectangle") {
            const rectangle = object as RectangleRenderable;
            let points: Point[] = CollisionEngine.getRectanglePoints(rectangle);

            segments.push(new LineInert(points[points.length - 1], points[0]));
            for (let i = 1; i < points.length; i++) {
                segments.push(new LineInert(points[i - 1], points[i]));
            }

        }

        if (object.shape == "circle") {
            const circle = object as CircleRenderable;
            axes.push(new LineInert(new Point(object.x, object.y), CollisionEngine.closestVertexToCircle(otherShape, circle)));
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

        //Generate the normals of any segments
        for (const segment of segments) {
            if (segment.start.x == segment.end.x) {
                const midpoint = new Point((segment.start.x + segment.end.x) / 2, (segment.start.y + segment.end.y) / 2);

                const newPoint = new Point(midpoint.x + 1, midpoint.y);

                axes.push(new LineInert(midpoint, newPoint));

            }

            else if (segment.start.y == segment.end.y) {
                const midpoint = new Point((segment.start.x + segment.end.x)/ 2, (segment.start.y + segment.end.y)/2);

                const newPoint = new Point(midpoint.x, midpoint.y + 1);

                axes.push(new LineInert(midpoint, newPoint));
            }

            else {
                const dx = segment.end.x - segment.start.x;
                const dy = segment.end.y - segment.start.y;

                const newPoint = new Point(-dy, dx);

                axes.push(new LineInert(new Point(0, 0), newPoint));

            }
        }

        //Normalize to unit vector
        axes = axes.map(function (axis: LineInert): LineInert {

            const dx = axis.end.x - axis.start.x;
            const dy = axis.end.y - axis.start.y;

            const magnitude = Math.sqrt(Math.pow(dx,2) + Math.pow(dy, 2));

            return new LineInert(new Point(0, 0), new Point((dx) / magnitude, (dy) / magnitude));

        });

        return axes
    }

    SAT(first: BaseRenderable | SubObject, second: BaseRenderable | SubObject): boolean {
        if (first.shape == "none" || second.shape == "none") {
            return false;
        }

        let axes: LineInert[] = []

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
            if (isSubObject(object) && object.nocollide) {
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

    constructor(object: BaseRenderable | SubObject, axis: LineInert) {
        this.max = -Infinity;
        this.min = Infinity;
        let axisMagnitude = Math.sqrt(Math.pow(axis.start.x - axis.end.x, 2) + Math.pow(axis.start.y - axis.end.y, 2))
        let unitAxis = new LineInert(new Point(0, 0), new Point((axis.end.x - axis.start.x)/axisMagnitude, (axis.end.y - axis.start.y)/axisMagnitude));


        let points: Point[]

        switch (object.shape) {
            case "none":
                console.error(object);
                throw new Error("Attempt to project object with no shape!");

            case "polygon":
                const polygon = object as PolygonRenderable;
                points = Renderer.calculatePoints(polygon.vertexes, polygon.apothem, object.x, object.y, object.rotation ? object.rotation : 0);
                let adjustedPoints: Point[] = [];

                for (let point of points) {
                    adjustedPoints.push(point.add(new Point(-object.x, -object.y))); //Make sure point is in terms of origin of shape.
                }

                for (let point of adjustedPoints) {
                    const projection = (point.x * unitAxis.end.x + point.y * unitAxis.end.y);

                    this.min = Math.min(projection, this.min);

                    this.max = Math.max(projection, this.max);

                }

                break;

            case "line":
                const line = object as LineRenderable;

                const startProjection = (object.x * unitAxis.end.x) + (object.y * unitAxis.end.y)
                const endProjection = (line.end.x * unitAxis.end.x) + (line.end.y * unitAxis.end.y);

                this.min = Math.min(startProjection, endProjection);
                this.max = Math.max(startProjection, endProjection);
                break;

            case "circle":
                const circle = object as CircleRenderable;

                this.min = ((object.x - circle.radius) * unitAxis.end.x) + (object.y * unitAxis.end.y);
                this.max = ((object.x + circle.radius) * unitAxis.end.x) + (object.y * unitAxis.end.y);
                break;

            case "rectangle":
                const rectangle = object as RectangleRenderable;

                let origin = new Point(object.x + rectangle.width/2, object.y + rectangle.height/2);

                points = [new Point(object.x - origin.x, object.y - origin.y), new Point(object.x + rectangle.width - origin.x, object.y - origin.y), new Point(object.x + rectangle.width - origin.x, object.y + rectangle.height - origin.y), new Point(object.x - origin.x, object.y + rectangle.height - origin.y)];

                for (let point of points) {
                    const projection = (point.x * unitAxis.end.x + point.y * unitAxis.end.y);

                    this.min = Math.min(projection, this.min);
                    this.max = Math.max(projection, this.max);
                }

                break;
        }
    }

}