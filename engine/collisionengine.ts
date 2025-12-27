import { Renderable, SubObject, isSubObject } from "./renderable.js";
import { Renderer } from "./renderer.js";
import { Point } from "./point.js";
import { LineInert } from "./line.js";

export class CollisionEngine {
    private cache: Record<string, MinMaxProjection>;
    public readonly MAP_FACTOR: number;
    constructor(mapFactor: number) {
        this.cache = {};
        this.MAP_FACTOR = mapFactor;
    }

    SAT(first: Renderable | SubObject, second: Renderable | SubObject): boolean {
        let normals: Point[] = []

        let segments: LineInert[] = []

        

        return false;
    }

    SpatialMap(objects: (Renderable | SubObject)[]): (Renderable | SubObject)[][][] {
        let SpatialMap: (Renderable | SubObject)[][][] = []
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

    clear(): void {
        this.cache = {};
    }
}


class MinMaxProjection {

    public min: number;
    public max: number;

    constructor(object: Renderable | SubObject, axis: LineInert) {
        let axisMagnitude = Math.sqrt(Math.pow(axis.start.x - axis.end.x, 2) + Math.pow(axis.start.y - axis.end.y, 2))
        let unitAxis = new LineInert(new Point(0, 0), new Point((axis.end.x - axis.start.x)/axisMagnitude, (axis.end.y - axis.start.y)/axisMagnitude));

        switch (object.shape) {
            case "none":
                console.error(object);
                throw new Error("Attempt to project object with no shape!");
                break;

            case "polygon":
                let points: Point[] = Renderer.calculatePoints(object.vertexes, object.apothem, object.x, object.y, object.rotation ? object.rotation : 0);
                let adjustedPoints: Point[] = [];

                for (let point of points) {
                    adjustedPoints.push(point.add(new Point(-object.x, -object.y))); //Make sure point is in terms of origin of shape.
                }

                for (let point of adjustedPoints) {
                    const projection = (point.x * unitAxis.end.x + point.y * unitAxis.end.y);

                    if (this.min) {
                        this.min = Math.min(projection, this.min);
                    }
                    else {
                        this.min = projection;
                    }

                    if (this.max) {
                        this.max = Math.max(projection, this.max);
                    }
                    else {
                        this.max = projection;
                    }
                }

                break;

            case "line":
                const startProjection = (object.x * unitAxis.end.x) + (object.y * unitAxis.end.y)
                const endProjection = (object.end.x * unitAxis.end.x) + (object.end.y * unitAxis.end.y);

                this.min = Math.min(startProjection, endProjection);
                this.max = Math.max(startProjection, endProjection);
                break;

            case "circle":
                this.min = ((object.x - object.radius) * unitAxis.end.x) + (object.y * unitAxis.end.y);
                this.max = ((object.x + object.radius) * unitAxis.end.x) + (object.y * unitAxis.end.y);
                break;

            case "rectangle":
                let origin = new Point(object.x + object.width/2, object.y + object.height/2);

                points = [new Point(object.x - origin.x, object.y - origin.y), new Point(object.x + object.width - origin.x, object.y - origin.y), new Point(object.x + object.width - origin.x, object.y + object.height - origin.y), new Point(object.x - origin.x, object.y + object.height - origin.y)];

                for (let point of adjustedPoints) {
                    const projection = (point.x * unitAxis.end.x + point.y * unitAxis.end.y);

                    if (this.min) {
                        this.min = Math.min(projection, this.min);
                    }
                    else {
                        this.min = projection;
                    }

                    if (this.max) {
                        this.max = Math.max(projection, this.max);
                    }
                    else {
                        this.max = projection;
                    }
                }

                break;
        }
    }

}