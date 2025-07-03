import {
    Euler,
    EulerTuple,
    PerspectiveCamera,
    Quaternion,
    Vector3,
    Vector3Tuple,
    WebGLRenderer
} from "three";
import { Environment } from "../Environment";
import { Easing, Tween } from "@tweenjs/tween.js"

interface ThreeCameraSnapshot {
    p: Vector3Tuple;
    r: EulerTuple;
}

export class ThreeCameraController {
    camera: PerspectiveCamera;
    private _fov: number = 110;
    private _near: number = 1;
    private _far: number = 1000;
    private _zoom: number = 1;

    constructor() {
        this.camera = new PerspectiveCamera(
            this._fov,
            Environment.width / Environment.height,
            this._near,
            this._far
        );
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

    /**
     * Setup camera settings
     * @param opt.far
     * @param opt.near
     * @param opt.zoom
     * @param opt.fov
     */
    setupCamera(opt: {
        far?: number;
        near?: number;
        zoom?: number;
        fov?: number;
    }): void {
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
        if (opt.p) {
            this.camera.position.set(opt.p[0], opt.p[1], opt.p[2]);
        }
        if (opt.r) {
            this.camera.rotation.set(opt.r[0], opt.r[1], opt.r[2]);
        }
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
                rot: new Quaternion().setFromEuler(
                    new Euler(...p.r)
                )
            });
        }

        const distances: number[] = [];
        let totalDistance = 0;
        for (let i = 0; i < snapshots.length; i++) {
            const pFrom = snapshots[i].pos;
            const dist = pFrom.distanceTo(
                i == 0 ? this.camera.position.clone() : snapshots[i - 1].pos
            );
            totalDistance += dist;
            distances.push(dist);
        }

        if (this._moveTweens.length != 0) {
            this.stopMoveTo();
        }

        for (let i = 0; i < snapshots.length; i++) {
            const fromPos =
                i == 0 ? this.camera.position.clone() : snapshots[i - 1].pos;
            const toPos = snapshots[i].pos;
            const fromRot =
                i == 0 ? this.camera.quaternion.clone() : snapshots[i - 1].rot;
            const toRot = snapshots[i].rot;
            const time = (distances[i] / totalDistance) * totalTime;

            const easing =
                i == 0
                    ? Easing.Sinusoidal.In
                    : i == snapshots.length - 1
                    ? Easing.Sinusoidal.Out
                    : undefined;
            const newMoveTween = this.tweenMoveFromTo(
                fromPos,
                toPos,
                time,
                easing
            );
            if (i != 0) {
                this._moveTweens[i - 1].chain(newMoveTween);
            }
            this._moveTweens.push(newMoveTween);

            const newRotTween = this.tweenRotFromTo(fromRot, toRot, time);
            if (i != 0) {
                this._rotTweens[i - 1].chain(newRotTween);
            }
            this._rotTweens.push(newRotTween);
        }

        this._moveTweens[0].start();
        this._rotTweens[0].start();
    }

    private tweenMoveFromTo(
        pStart: Vector3,
        pEnd: Vector3,
        seconds: number,
        easing?: (k: number) => number
    ): Tween<any> {
        const time = { t: 0 };
        return new Tween(time)
            .to({ t: 1 }, seconds * 1000)
            .easing(easing || Easing.Linear.None)
            .onUpdate(() => {
                this.camera.position.lerpVectors(pStart, pEnd, time.t);
            })
            .onComplete(() => {
                this.camera.position.copy(pEnd);
            });
    }

    private tweenRotFromTo(
        qStart: Quaternion,
        qEnd: Quaternion,
        seconds: number,
        easing?: (k: number) => number
    ): Tween<any> {
        const time = { t: 0 };
        return new Tween(time)
            .to({ t: 1 }, seconds * 1000)
            .easing(easing || Easing.Sinusoidal.InOut)
            .onUpdate(() => {
                this.camera.quaternion.slerpQuaternions(qStart, qEnd, time.t);
            })
            .onComplete(() => {
                this.camera.quaternion.copy(qEnd);
            });
    }

    update(dtms: number): void {}

    resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.fov = this.calculateFOV(this._fov);
        this.camera.updateProjectionMatrix();
    }
}