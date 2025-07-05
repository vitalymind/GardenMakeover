import  {Euler,EulerTuple,Mesh,Object3D,PerspectiveCamera,Quaternion,Raycaster,Scene,SkinnedMesh,Vector2,Vector3,Vector3Tuple } from "three";
import { Environment } from "./Environment";
import { Easing, Tween } from "@tweenjs/tween.js"
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { r3 } from "../helpers";
import { models } from "../loader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface ThreeCameraSnapshot {
    p: Vector3Tuple;
    r: EulerTuple;
}

class DebugObjectManipulator {
    private ray: Raycaster;

    private boundMousedown: (event: MouseEvent) => void;
    private boundMousemove: (event: MouseEvent) => void;
    private boundKeydown: (event: KeyboardEvent) => void;
    private _isEnabled = false;

    private transformControls: TransformControls;
    private beingTransformed = false;
    private selected: Object3D | undefined;

    private cursorIndex: number | undefined;
    private cursorPos = new Vector3();
    private cursorModel = "";
    cursor: Object3D;

    constructor(private camera: PerspectiveCamera, private stage: Scene) {
        this.boundMousedown = this.mousedown.bind(this);
        this.boundKeydown = this.keydown.bind(this);
        this.boundMousemove = this.mousemove.bind(this);

        this.ray = new Raycaster();

        this.transformControls = new TransformControls(this.camera,window.document.body);
        stage.add(this.transformControls.getHelper());

        this.cursor = new Object3D();
        stage.add(this.cursor);

        this.transformControls.addEventListener("mouseDown", e => {
            if (!this.selected) {return;}
            this.beingTransformed = true;
        });
        this.transformControls.addEventListener("mouseUp", e => {
            if (!this.selected) {return;}
            this.beingTransformed = false;
        });
    }

    public get enable(): boolean {return this._isEnabled}

    set enable(enable: boolean) {
        this._isEnabled = enable;
        if (enable) {
            this.addListners();
        } else {
            this.removeListners();
            this.transformControls.detach();
            this.selected = null;
        }
    }

    private addListners(): void {
        window.addEventListener("pointerdown", this.boundMousedown);
        window.addEventListener("keydown", this.boundKeydown)
        document.addEventListener("pointermove", this.boundMousemove);
    }

    private removeListners(): void {
        window.removeEventListener("pointerdown", this.boundMousedown);
        window.removeEventListener("keydown", this.boundKeydown);
        document.removeEventListener("pointermove", this.boundMousemove);
    }

    private keydown(event: KeyboardEvent): void {
        //console.log(event.code);
        if (event.code == "KeyR") {
            const mode = this.transformControls.getMode();
            this.transformControls.setMode(
                mode == "translate" ? "rotate":
                mode == "rotate" ? "scale":
                "translate"
            );
        }
        if (event.code == "KeyT") {
            this.transformControls.setSpace(this.transformControls.space == "local" ? "world": "local");
        }
        if (event.code == "ArrowRight") {
            this.nextCursorObject(1);
        }
        if (event.code == "ArrowLeft") {
            this.nextCursorObject(-1);
        }
        if (event.code == "Escape") {
            if (this.cursor.children.length > 0) {
                this.cursor.children[0].removeFromParent();
                this.cursorModel = "";
                this.cursorIndex = undefined;
                this.cursorPos.set(0,0,0);
            }
        }
        if (event.code == "Delete") {
            if (this.selected) {
                const trackable = Environment.gc.gameScene.trackableObjects;
                for (const key of Object.keys(trackable)) {
                    if (this.selected == trackable[key]) {
                        trackable[key].removeFromParent();
                        delete trackable[key];
                        this.select(undefined);
                    }
                }
            }
        }
    }

    private mousedown(event: MouseEvent): void {
        if (event.button == 0) {
            if (this.cursor.children.length > 0) {
                Environment.gc.gameScene.makeStaticObject({
                    n: this.cursorModel,
                    p: this.cursorPos.toArray(),
                    r: [0,0,0,0],
                    s: [1,1,1]
                });

            } else {
                if (this.beingTransformed) {return;}
                const trackable = this.raycast(event);
                this.select(trackable);
            }
        }
    }

    private mousemove(event: MouseEvent): void {
        if (this.cursor.children.length > 0) {
            this.raycast(event);
            this.cursor.position.copy(this.cursorPos);
        }
    }

    private nextCursorObject(dir: number): void {
        if (Object.keys(models).length == 0) {
            console.log(`[Cursor]: No models to scroll through`);
            return;
        }
        const arr = Object.keys(models);
        if (this.cursorIndex === undefined) {this.cursorIndex = 0}
        else {
            //Scroll through array
            let next = this.cursorIndex + dir;
            if (next == -1) {next = arr.length - 1}
            this.cursorIndex = next % arr.length;
        }
        for (const child of this.cursor.children) {
            this.cursor.remove(child);
        }
        this.cursor.add(clone(models[arr[this.cursorIndex]].scene));
        this.cursorModel = arr[this.cursorIndex];
        console.log(`[Cursor]: Cursor object set to ${arr[this.cursorIndex]}`)
    }

    private raycast(event: MouseEvent): Object3D | undefined {
        const point = new Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const allTrackable = Object.values(Environment.gc.gameScene.trackableObjects);

        this.ray.setFromCamera(point, this.camera);
        const intersects = this.ray.intersectObjects(this.stage.children,true);
        for (const hit of intersects) {
            const obj = hit.object;
            if (obj instanceof Mesh || obj instanceof SkinnedMesh) {
                //Save hit pos for cursor
                this.cursorPos.copy(hit.point);

                let trackable: Object3D;
                obj.traverseAncestors(o => {
                    if (allTrackable.includes(o)) {trackable = o;}
                });
                if (trackable) {return trackable;}
            }
        }
        this.cursorPos.set(0,0,0);
        return null;
    }

    private select(object: Object3D | undefined): void {
        if (!this._isEnabled) {return;}
        this.selected = object;
        if (this.selected) {
            this.transformControls.attach(object);
        } else {
            this.transformControls.detach();
        }
    }
}

class DebugCameraControls {
    cameraMoveSpeed = 1;
    cameraRotationSpeed = 1.5;

    private _dragToLook = true;
    private _autoForward = false;
    private _mouseStatus = 0;
    private _moveState = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        pitchUp: 0,
        pitchDown: 0,
        yawLeft: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0
    };
    private _moveVector = new Vector3(0, 0, 0);
    private _rotationVector = new Vector3(0, 0, 0);
    private _vector3Up = new Vector3(0, 1, 0);
    private _isEnabled = false;

    private boundKeydown: (event: KeyboardEvent) => void;
    private boundKeyup: (event: KeyboardEvent) => void;
    private boundMousemove: (event: MouseEvent) => void;
    private boundMousedown: (event: MouseEvent) => void;
    private boundMouseup: (event: MouseEvent) => void;

    constructor(private _object: PerspectiveCamera) {
        this.updateMovementVector();
        this.updateRotationVector();

        this.boundKeydown = this.keydown.bind(this);
        this.boundKeyup = this.keyup.bind(this);
        this.boundMousemove = this.mousemove.bind(this);
        this.boundMousedown = this.mousedown.bind(this);
        this.boundMouseup = this.mouseup.bind(this);
    }

    private makeSnapShot(): void {
        const s: ThreeCameraSnapshot = {
            p: this._object.position.toArray(),
            r: this._object.rotation.toArray()
        };
        let text = "";
        text += `{p:[${r3(s.p[0])},${r3(s.p[1])},${r3(s.p[2])}],`;
        text += `r:[${r3(s.r[0])},${r3(s.r[1])},${r3(s.r[2])}]}`;

        console.log("Camera snapshot created");

        window.navigator.clipboard.writeText(text);
    }  

    private addListners(): void {
        document.addEventListener("contextmenu", this.contextmenu);
        window.addEventListener("keydown", this.boundKeydown);
        window.addEventListener("keyup", this.boundKeyup);
        document.addEventListener("pointermove", this.boundMousemove);
        document.addEventListener("pointerdown", this.boundMousedown);
        document.addEventListener("pointerup", this.boundMouseup);
    }

    private removeListners(): void {
        document.removeEventListener("contextmenu", this.contextmenu);
        window.removeEventListener("keydown", this.boundKeydown);
        window.removeEventListener("keyup", this.boundKeyup);
        document.removeEventListener("pointermove", this.boundMousemove);
        document.removeEventListener("pointerdown", this.boundMousedown);
        document.removeEventListener("pointerup", this.boundMouseup);
    }

    public get enable(): boolean {
        return this._isEnabled;
    }

    set enable(enable: boolean) {
        this._isEnabled = enable;
        if (enable) {
            this.addListners();
        } else {
            this.removeListners();
            this._moveState = {
                up: 0,
                down: 0,
                left: 0,
                right: 0,
                forward: 0,
                back: 0,
                pitchUp: 0,
                pitchDown: 0,
                yawLeft: 0,
                yawRight: 0,
                rollLeft: 0,
                rollRight: 0
            };
            this._mouseStatus = 0;
            this.updateMovementVector();
            this.updateRotationVector();
        }
    }

    private contextmenu(event: MouseEvent): void {
        event.preventDefault();
    }

    private keydown(event: KeyboardEvent): void {
        if (event.altKey) {return;}

        if (event.code == "KeyW") {this._moveState.forward = 1}
        else if (event.code == "KeyS" && !event.shiftKey) {this._moveState.back = 1}
        else if (event.code == "KeyA") {this._moveState.left = 1}
        else if (event.code == "KeyD") {this._moveState.right = 1}
        else if (event.code == "KeyQ") {this._moveState.down = 1}
        else if (event.code == "KeyE") {this._moveState.up = 1}

        else if (event.code == "KeyC" && event.shiftKey) {this.makeSnapShot()}

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private keyup(event: KeyboardEvent): void {
        switch (event.code) {
            case "KeyW":
                this._moveState.forward = 0;
                break;
            case "KeyS":
                this._moveState.back = 0;
                break;

            case "KeyA":
                this._moveState.left = 0;
                break;
            case "KeyD":
                this._moveState.right = 0;
                break;

            case "ArrowUp":
                this._moveState.pitchUp = 0;
                break;
            case "ArrowDown":
                this._moveState.pitchDown = 0;
                break;

            case "ArrowLeft":
                this._moveState.yawLeft = 0;
                break;
            case "ArrowRight":
                this._moveState.yawRight = 0;
                break;

            case "KeyQ":
                this._moveState.down = 0;
                break;
            case "KeyE":
                this._moveState.up = 0;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private mousedown(event: MouseEvent): void {
        if (event.button == 2) {
            document.body.requestPointerLock();
            this._mouseStatus += 1;
        }
    }

    private mousemove(event: MouseEvent): void {
        if (!this._dragToLook || this._mouseStatus > 0) {
            this._moveState.yawLeft = event.movementX / 10;
            this._moveState.pitchDown = event.movementY / 10;

            this.updateRotationVector();
        }
    }

    private mouseup(event: MouseEvent): void {
        if (event.button == 2) {
            document.exitPointerLock();

            this._mouseStatus -= 1;
            this._moveState.yawLeft = this._moveState.pitchDown = 0;
        }

        this.updateRotationVector();
    }

    private deg2rad(degrees: number): number {
        return (degrees * Math.PI) / 180;
    };

    update(deltams: number): void {
        if (!this._isEnabled) {
            return;
        }

        //Smooth on performance spikes and mouse artifacts
        const mouseThreshhold = 1;
        if (deltams > 20) {
            deltams = 20;
        }
        if (Math.abs(this._rotationVector.x) > mouseThreshhold) {
            this._rotationVector.x =
                this._rotationVector.x > 0 ? mouseThreshhold : -mouseThreshhold;
        }
        if (Math.abs(this._rotationVector.y) > mouseThreshhold) {
            this._rotationVector.y =
                this._rotationVector.y > 0 ? mouseThreshhold : -mouseThreshhold;
        }

        const moveMult = deltams * (this.cameraMoveSpeed / 100);
        const rotMult = deltams * (this.cameraRotationSpeed / 10);
        this._object.translateX(this._moveVector.x * moveMult);
        this._object.translateY(this._moveVector.y * moveMult);
        this._object.translateZ(this._moveVector.z * moveMult);

        this._object.rotateX(this.deg2rad(this._rotationVector.x * rotMult));
        this._object.rotateOnWorldAxis(
            this._vector3Up,
            this.deg2rad(this._rotationVector.y * rotMult)
        );

        this._rotationVector.x = 0;
        this._rotationVector.y = 0;
    }

    private updateMovementVector(): void {
        const forward =
            this._moveState.forward ||
            (this._autoForward && !this._moveState.back)
                ? 1
                : 0;

        this._moveVector.x = -this._moveState.left + this._moveState.right;
        this._moveVector.y = -this._moveState.down + this._moveState.up;
        this._moveVector.z = -forward + this._moveState.back;
    }

    private updateRotationVector(): void {
        this._rotationVector.x +=
            -this._moveState.pitchDown + this._moveState.pitchUp;
        this._rotationVector.y +=
            +this._moveState.yawRight - this._moveState.yawLeft;
    }
}

export class ThreeCameraController {
    camera: PerspectiveCamera;
    private _fov: number = 110;
    private _near: number = 1;
    private _far: number = 1000;
    private _zoom: number = 1;

    debugCameraControls: DebugCameraControls;
    debugObjectManipulator: DebugObjectManipulator;

    constructor(public stage: Scene) {
        this.camera = new PerspectiveCamera(
            this._fov,
            Environment.width / Environment.height,
            this._near,
            this._far
        );

        this.debugCameraControls = new DebugCameraControls(this.camera);
        this.debugCameraControls.enable = true;

        this.debugObjectManipulator = new DebugObjectManipulator(this.camera, this.stage);
        this.debugObjectManipulator.enable = true;
    }

    set far(val: number) {
        this._far = Math.max(0, val);
        this.camera.far = this._far;
        this.camera.updateProjectionMatrix();
    }

    get far(): number {
        return this._far;
    }

    set zoom(val: number) {
        this._zoom = Math.max(0, val);
        this.camera.zoom = this._zoom;
        this.camera.updateProjectionMatrix();
    }

    get zoom(): number {
        return this._zoom;
    }

    set near(val: number) {
        this._near = Math.max(0, val);
        this.camera.near = this._near;
        this.camera.updateProjectionMatrix();
    }

    get near(): number {
        return this._near;
    }

    set fov(val: number) {
        this._fov = Math.min(180, Math.max(1, val));
        this.camera.fov = this.calculateFOV(this._fov);
        this.camera.updateProjectionMatrix();
    }

    get fov(): number {
        return this._fov;
    }

    setupCamera(opt: {far?: number;near?: number;zoom?: number;fov?: number;}): void {
        if (opt.far != undefined) {
            this._far = Math.max(0, opt.far);
            this.camera.far = this._far;
        }
        if (opt.near != undefined) {
            this._near = Math.max(0, opt.near);
            this.camera.near = this._near;
        }
        if (opt.zoom != undefined) {
            this._zoom = Math.max(0, opt.zoom);
            this.camera.zoom = this._zoom;
        }
        if (opt.fov != undefined) {
            this._fov = Math.min(180, Math.max(1, opt.fov));
            this.camera.fov = this.calculateFOV(this._fov);
        }
        this.camera.updateProjectionMatrix();
    }

    private calculateFOV(fov: number): number {
        return this.camera.aspect < 1 ? (Math.atan(Math.tan((fov * Math.PI) / 360) / this.camera.aspect) * 360) / Math.PI : fov;
    }

    setTo(opt: { p?: Vector3Tuple; r?: EulerTuple }): void {
        if (opt.p) {this.camera.position.set(opt.p[0], opt.p[1], opt.p[2]);}
        if (opt.r) {this.camera.rotation.set(opt.r[0], opt.r[1], opt.r[2]);}
    }

    private _moveTweens: Tween<Vector3>[] = [];
    private _rotTweens: Tween<Quaternion>[] = [];

    stopMoveTo(): void {
        this._moveTweens[0].stopChainedTweens();
        this._moveTweens[0].stop();
        this._rotTweens[0].stopChainedTweens();
        this._rotTweens[0].stop();
        this._moveTweens.length = 0;
        this._rotTweens.length = 0;
    }

    moveTo(points: ThreeCameraSnapshot[], totalTime: number): void {
        const snapshots: { pos: Vector3; rot: Quaternion }[] = [];
        for (const p of points) {
            snapshots.push({
                pos: new Vector3(...p.p),
                rot: new Quaternion().setFromEuler(new Euler(...p.r))
            });
        }

        const distances: number[] = [];
        let totalDistance = 0;
        for (let i = 0; i < snapshots.length; i++) {
            const pFrom = snapshots[i].pos;
            const dist = pFrom.distanceTo(i == 0 ? this.camera.position.clone() : snapshots[i - 1].pos);
            totalDistance += dist;
            distances.push(dist);
        }

        if (this._moveTweens.length != 0) {
            this.stopMoveTo();
        }

        for (let i = 0; i < snapshots.length; i++) {
            const fromPos = i == 0 ? this.camera.position.clone() : snapshots[i - 1].pos;
            const toPos = snapshots[i].pos;
            const fromRot = i == 0 ? this.camera.quaternion.clone() : snapshots[i - 1].rot;
            const toRot = snapshots[i].rot;
            const time = (distances[i] / totalDistance) * totalTime;

            const easing = i == 0 ? Easing.Sinusoidal.In :
                i == snapshots.length - 1 ? Easing.Sinusoidal.Out :
                undefined;
            const newMoveTween = this.tweenMoveFromTo(fromPos,toPos,time,easing);
            if (i != 0) {this._moveTweens[i - 1].chain(newMoveTween)}
            this._moveTweens.push(newMoveTween);

            const newRotTween = this.tweenRotFromTo(fromRot, toRot, time);
            if (i != 0) {this._rotTweens[i - 1].chain(newRotTween)}
            this._rotTweens.push(newRotTween);
        }

        this._moveTweens[0].start();
        this._rotTweens[0].start();
    }

    private tweenMoveFromTo(pStart: Vector3,pEnd: Vector3,seconds: number,easing?: (k: number) => number): Tween<any> {
        const time = { t: 0 };
        return new Tween(time)
            .to({ t: 1 }, seconds * 1000)
            .easing(easing || Easing.Linear.None)
            .onUpdate(() => {this.camera.position.lerpVectors(pStart, pEnd, time.t);})
            .onComplete(() => {this.camera.position.copy(pEnd);});
    }

    private tweenRotFromTo(qStart: Quaternion,qEnd: Quaternion,seconds: number,easing?: (k: number) => number): Tween<any> {
        const time = { t: 0 };
        return new Tween(time)
            .to({ t: 1 }, seconds * 1000)
            .easing(easing || Easing.Sinusoidal.InOut)
            .onUpdate(() => {this.camera.quaternion.slerpQuaternions(qStart, qEnd, time.t);})
            .onComplete(() => {this.camera.quaternion.copy(qEnd);});
    }

    update(dtms: number): void {
        this.debugCameraControls.update(dtms);
    }

    resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.fov = this.calculateFOV(this._fov);
        this.camera.updateProjectionMatrix();
    }
}