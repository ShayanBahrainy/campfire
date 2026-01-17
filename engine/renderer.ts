import { CollisionEngine } from "./collisionengine.js";
import { Point } from "./point.js";
import { RecieveKeyPress, isRecieveKeyPress } from "./recievekeypress.js";
import { isSubObject, BaseRenderable, SubObject, RectangleRenderable, CircleRenderable, LineRenderable, PolygonRenderable } from "./renderable.js";
import { RenderComponent } from "./rendercomponent.js";

enum CameraMode {fixed, follow};

export class Renderer {
    static width = 1280;
    static height = 720;
    static FPS = 60;
    static instance: Renderer;

    objects: BaseRenderable[];
    fps: number;

    canvas: HTMLCanvasElement;

    intervalId: NodeJS.Timeout;

    collision_engine: CollisionEngine;

    private camera_mode: CameraMode;

    private camera_follow: BaseRenderable;

    private rand_seed: number;

    constructor() {
        this.objects = [];
        this.fps = Renderer.FPS;
        Renderer.instance = this;

        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);

        this.tick = this.tick.bind(this);
        this.collisionChecks = this.collisionChecks.bind(this);
        this.removeObject = this.removeObject.bind(this);

        this.intervalId = setInterval(this.tick,Math.round(1000/this.fps));

        this.collision_engine = new CollisionEngine(200);

        this.camera_mode = CameraMode.fixed;

        this.rand_seed = Math.random() * 2**32;
    }

    getRenderables() {
        let renderObjects: (BaseRenderable | SubObject)[] = []
        for (let object of this.objects) {
            if (object.shape != null || object.shape != "none") {
                renderObjects.push(object);
            }

            //Appends renderparts if it exists
            renderObjects = [...renderObjects, ...object.renderparts??[]]
        }
        renderObjects = Renderer.sortObjects(renderObjects)
        let data = []
        let dominant: RenderComponent | undefined
        for (let object of renderObjects) {
            if (Object.hasOwn(object, "text")){
                let text: RenderComponent = {type: "text", text: object.text, x: object.x, y: object.y + 20, screenpositioning: object.screenpositioning ?? false}
                if (object.isdominant) {
                    dominant = text
                    dominant.dominant = true
                }
                data.push(text)
            }

            if (object.shape == "none") {
                continue;
            }

            let render: RenderComponent = {x: Infinity, y: Infinity, type: "line", screenpositioning: object.screenpositioning ?? false}
            render.fillStyle = object.fillStyle
            render.x = object.x
            render.y = object.y

            if (object.rotation) {
                render.rotation = object.rotation
            }

            if (object.shape == "rectangle"){
                const rect = object as RectangleRenderable;
                render.type = "rectangle";
                render.width = rect.width;
                render.height = rect.height;
            }

            if (object.shape == "circle"){
                const circle = object as CircleRenderable;
                render.type = "circle";
                render.radius = circle.radius;
                render.angle = circle.angle ? circle.angle : 360;
            }

            if (object.shape == "line") {
                const line = object as LineRenderable;
                render.type = "line";
                render.end = line.end;
                render.width = line.width;
            }

            if (object.shape == "polygon") {
                const polygon = object as PolygonRenderable;
                render.type = "polygon";
                render.apothem = polygon.apothem;
                render.vertexes = polygon.vertexes;
            }

            data.push(render)
            if (dominant && dominant.dominant) {
                return [dominant]
            }
        }
        return data
    }

    destruct() {
        clearInterval(this.intervalId)
    }


    tick() {
        this.canvas.width = document.documentElement.clientWidth;
        this.canvas.height = document.documentElement.clientHeight;
        this.collisionChecks();
        let renderObjects = Renderer.sortObjects(this.objects);
        for (let key in renderObjects) {
            let object = renderObjects[key];
            object.update();
        }
        this.draw(this.getRenderables());
    }

    static calculateSpatialMap(objects: (BaseRenderable | SubObject)[]): (BaseRenderable | SubObject)[][][] {
        let SpatialMap: (BaseRenderable | SubObject)[][][] = []
        for (let object of objects){
            if (isSubObject(object) && object.nocollide) {
                continue;
            }
            let X = Math.floor(object.x/600)
            if (SpatialMap[X] == null) {
                SpatialMap[X] = []
            }
            let Y = Math.floor(object.y/600)
            if (SpatialMap[X][Y] == null) {
                SpatialMap[X][Y] = []
            }
            SpatialMap[X][Y].push(object)
        }
        return SpatialMap
    }

    static narrowPhaseChecks(objects: (BaseRenderable | SubObject)[]) {
        let cewidth: number
        let ceheight: number
        let crwidth: number
        let crheight: number
        for (let collidee of objects) {
            if (collidee.shape == "line") continue;
            if (collidee.shape == "rectangle"){
                const rectangle = collidee as RectangleRenderable;
                cewidth = rectangle.width;
                ceheight = rectangle.height;
            }
            if (collidee.shape == "circle"){
                const circle = collidee as CircleRenderable;
                cewidth = circle.radius * 2
                ceheight = circle.radius * 2
            }
            if (collidee.shape == "polygon") {
                const polygon = collidee as PolygonRenderable;
                cewidth = polygon.apothem * 2;
                ceheight = polygon.apothem * 2;
            }
            for (let collider of objects) {
                if (collidee == collider) {
                    continue
                }
                if (collider.shape == "line") continue;
                if (collider.shape == "rectangle"){
                    const collider_rectangle = collider as RectangleRenderable;
                    crwidth = collider_rectangle.width;
                    crheight = collider_rectangle.height;
                }
                if (collider.shape == "circle"){
                    const collider_circle = collider as CircleRenderable;
                    crwidth = collider_circle.radius * 2;
                    crheight = collider_circle.radius * 2; //Radius is already the half "width" so multiply by two
                }

                if (collider.shape == "polygon") {
                    const collider_polygon = collider as PolygonRenderable;
                    crwidth = collider_polygon.apothem * 2;
                    crheight = collider_polygon.apothem * 2;
                }

                //Implementation of Separating Axis Theorem
                let AverageXCollidee = (collidee.x + collidee.x + cewidth!)/2
                let AverageXCollider = (collider.x + collider.x + crwidth!)/2
                let AverageYCollidee = (collidee.y + collidee.y + ceheight!)/2
                let AverageYCollider = (collider.y + collider.y + crheight!)/2

                let HorizontonalLength  = Math.abs(AverageXCollidee - AverageXCollider)
                let VerticalLength = Math.abs(AverageYCollidee - AverageYCollider)

                HorizontonalLength -= (cewidth! + crwidth!)/2
                VerticalLength -= (ceheight! + crheight!)/2

                if (HorizontonalLength <= 0 && VerticalLength <= 0) {
                    ( isSubObject(collider) ? collider._parent : collider ).collision(( isSubObject(collidee) ? collidee._parent : collidee), (isSubObject(collidee) ? collidee : undefined));
                }
            }
        }
    }
    collisionChecks() {
        //Tag subobjects with parents
        let allObjects: Array<BaseRenderable | SubObject> = [];
        for (let object of this.objects) {
            allObjects.push(object);
            if (object.renderparts) {
                let updatedSubObjects: SubObject[] = [];
                for (let subObject of object.renderparts) {
                    subObject._parent = object;
                    updatedSubObjects.push(subObject)
                }
                allObjects.push(...updatedSubObjects);
            }
        }

        //Spatial maps are 2d arrays where first dimension is x, second is y, and the values are arrays of objects at that coordinate
        //Spatial Map = [[[Object1], [Object2]], [[Object3], [Object4,Object5]]]
        let SpatialMap = this.collision_engine.SpatialMap(allObjects);

        for (let X in SpatialMap) {
            if (!X) {
                continue;
            }
            for (let Y in SpatialMap[X]) {
                if (!Y) {
                    continue;
                }
                //Include any of the 4 neighboring quadrants IF they exist.
                let neighbors: (BaseRenderable|SubObject)[] = [...SpatialMap[X][Y]];
                if (SpatialMap[String(Number(X) - 1)] && SpatialMap[String(Number(X) - 1)][Y]) {
                    neighbors.push(...SpatialMap[String(Number(X) - 1)][Y])
                }
                if (SpatialMap[String(Number(X) + 1)] && SpatialMap[String(Number(X) + 1)][Y]) {
                    neighbors.push(...SpatialMap[String(Number(X) + 1)][Y])
                }
                if (SpatialMap[X][String(Number(Y) - 1)]) {
                    neighbors.push(...SpatialMap[X][String(Number(Y) - 1)])
                }
                if (SpatialMap[X][String(Number(Y) + 1)]) {
                    neighbors.push(...SpatialMap[X][String(Number(Y) + 1)])
                }

                for (let a of neighbors) {
                    for (let b of neighbors) {
                        if (a == b) continue;

                        if (this.collision_engine.SAT(a, b)) {
                            ( isSubObject(a) ? a._parent : a ).collision(( isSubObject(b) ? b._parent : b), (isSubObject(b) ? b : undefined), (isSubObject(a) ? a : undefined));
                        }

                    }
                }
            }
        }
    }

    private drawRect(ctx: CanvasRenderingContext2D, rectangle: RenderComponent) {
        let points: Point[] = Renderer.getRectanglePoints(rectangle);

        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for (let point of points.toSpliced(0,1)) {
            ctx.lineTo(point.x,point.y);
        }
        ctx.lineTo(points[0].x,points[0].y);
        ctx.fill();
        ctx.closePath();

    }

    cameraFollow(center: BaseRenderable) {
        this.camera_mode = CameraMode.follow;
        this.camera_follow = center;
    }

    cameraFixed() {
        this.camera_mode = CameraMode.fixed;
        this.camera_follow = null;
    }

    draw(renderData: RenderComponent[]) {
        if (this.camera_mode == CameraMode.follow) {
            for (const component of renderData) {
                if (component.screenpositioning) continue;
                component.x -= this.camera_follow.x - this.canvas.width/2;
                component.y -= this.camera_follow.y - this.canvas.height/2;
            }
        }

        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")
        for (let object of renderData) {
            ctx.resetTransform();

            //Polygons have their own rotation.
            if (object.rotation && object.type != "polygon" && object.type != "rectangle") {
                ctx.translate(object.x, object.y)
                ctx.rotate((object.rotation) * Math.PI / 180);
                ctx.translate(-object.x, -object.y)
            }

            switch (object.type) {
                case "text":
                    ctx.font = "18px Times New Roman"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillStyle = "#ffffffff"
                    ctx.fillText(object.text!,object.x,object.y)
                    break;
                case "rectangle":
                    ctx.fillStyle = object.fillStyle!
                    this.drawRect(ctx, object);
                    break;
                case "circle":
                    ctx.fillStyle = object.fillStyle!
                    ctx.beginPath()
                    ctx.arc(object.x, object.y, object.radius!, 0, object.angle!)
                    ctx.closePath()
                    ctx.fill()
                    break;
                case "polygon":
                    ctx.fillStyle = object.fillStyle!
                    this.drawConvex(ctx, object.vertexes!, object.apothem!, object.x, object.y, object.rotation!)
                    break;
                case "line":
                    ctx.beginPath()
                    ctx.strokeStyle = object.fillStyle!
                    ctx.lineWidth = object.width!
                    ctx.moveTo(object.x, object.y)
                    ctx.lineTo(object.end!.x, object.end!.y)
                    ctx.stroke()
                    break;
            }
        }


        let allObjects = []
        for (let obj of this.objects) {
            allObjects.push(obj)
            if (obj.renderparts) {
                allObjects.push(...obj.renderparts);
            }
        }
    }

    getFollowPoint(): Point {
        if (this.camera_mode != CameraMode.follow) {
            throw new Error("Attempt to retrieve follow point when camera mode is not follow.");
        }

        return new Point(this.camera_follow.x, this.camera_follow.y);
    }

    getCanvas() {
        return this.canvas;
    }
    getObjects() {
        return this.objects;
    }

    removeObject(object: BaseRenderable) {
        if (isRecieveKeyPress(object)) {
            const listener = object as any as RecieveKeyPress;
            window.removeEventListener("keydown", listener);
        }

        var index = this.objects.indexOf(object);
        if (index > -1){
            this.objects.splice(index,1);
        }
    }

    static calculatePoints(vertexQuantity: number, apothemLength: number, X: number, Y: number, rotation: number): Point[] {
        //Circle equation: (x-X)^2 + (y-Y)^2 = apothemLength^2
        //Point on path of circle: x = r * sin(rotation), y = r * cos(rotation)
        //Rotation = 360/vertexQuantity
        let Points: Point[] = []

        const RotationIncrements = 360/vertexQuantity

        let StartingOffset = Math.PI/vertexQuantity
        if (rotation) {
            StartingOffset += rotation * Math.PI/180
        }
        let currentRotation = 0
        while (currentRotation < 360) {
            let x = apothemLength * Math.cos((currentRotation * Math.PI/180) + StartingOffset) + X
            let y = apothemLength * Math.sin((currentRotation * Math.PI/180) + StartingOffset) + Y
            Points.push(new Point(x,y))
            currentRotation += RotationIncrements
        }
        return Points
    }

    drawConvex (context: CanvasRenderingContext2D, vertexes: number, apothem: number, x: number, y: number, rotation: number) {
        let points = Renderer.calculatePoints(vertexes, apothem, x, y, rotation);
        context.beginPath();
        context.moveTo(points[0].x,points[0].y);
        for (let point of points.toSpliced(0,1)) {
            context.lineTo(point.x,point.y);
        }
        context.lineTo(points[0].x,points[0].y);
        context.fill();
        context.closePath();
    }

    addObject(object: BaseRenderable){
        if (isRecieveKeyPress(object)) {
            const listener = object as any as RecieveKeyPress;
            window.addEventListener("keydown", listener);
        }
        this.objects.push(object);
    }
    static sortObjects(objects: BaseRenderable[]): BaseRenderable[];
    static sortObjects(objects: (BaseRenderable | SubObject)[]): (BaseRenderable | SubObject)[];
    static sortObjects(objects: any[]): any[] {
        return objects.sort((a, b) => a.priority - b.priority);
    }

    private static DegreesToRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    static getRectanglePoints(rectangle: RectangleRenderable | RenderComponent) {
        let points: Point[] = [];

        let untranslatedPoints: Point[] = [new Point(-rectangle.width/2, -rectangle.height/2), new Point(-rectangle.width/2, rectangle.height/2), new Point(rectangle.width/2, rectangle.height/2), new Point(rectangle.width/2, -rectangle.height/2)];

        let rotation = this.DegreesToRadians(rectangle.rotation ? rectangle.rotation : 0);

        const cx = rectangle.x + rectangle.width/2;
        const cy = rectangle.y + rectangle.height/2;

        const rotationMatrix = [
            [Math.cos(rotation), -Math.sin(rotation)],
            [Math.sin(rotation), Math.cos(rotation)]
        ];

        points = untranslatedPoints.map(function (point) {

            return new Point(point.x * rotationMatrix[0][0] + point.y * rotationMatrix[0][1], point.x * rotationMatrix[1][0] + point.y * rotationMatrix[1][1]);
        });


        const center = new Point(cx, cy);
        points = points.map(function (point) {
            return point.add(center);
        });

        return points;
    }

    generateRandom(a: number, b: number) {
        let h = Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ Math.imul(this.rand_seed, 128902331);
        h = (h ^ (h >>> 13)) * 1274126177;
        return (h ^ (h >>> 16)) >>> 0;
    }

    generateFloat(a: number, b: number): number {
        return this.generateRandom(a, b) / 2**32;
    }


}