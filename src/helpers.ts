import { Easing, Tween } from "@tweenjs/tween.js";
import { Environment } from "./classes/Environment";
import { Container, Point, PointData } from "pixi.js";
import { Mesh, MeshPhysicalMaterial, Object3D, Vector3 } from "three";

export const r3 = (val: number): number => {
    return Math.round(val * 1000) / 1000;
}

export const colorNumberToString = (input: number): string => {
    return `#${input.toString(16)}`;
};

export const colorStringToNumber = (input: string): number => {
    return Number(input.replace("#", "0x"));
};

export const clamp = (value: number, min: number, max: number): number => {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    }

    return value;
};

export const lerp = (a: number, b: number, t: number): number => {
    return (1 - t) * a + t * b;
};

export const unlerp = (a: number, b: number, v: number): number => {
    return (v - a) / (b - a);
};

export const remapClamped = (
    toStart: number,
    toEnd: number,
    fromStart: number,
    fromEnd: number,
    value: number
): number => {
    return lerp(toStart, toEnd, clamp(unlerp(fromStart, fromEnd, value), 0, 1));
};

export const delay = (durationMs: number): Promise<void> => {
    return new Promise(resolve=>{
        new Tween({a: 0}).to({a:1}, durationMs).group(Environment.tweenGroup).start(Environment.gameTimeMs).onComplete(()=>{resolve()});
    });
}

export const colorStringToRGB = (input: string, norm = false): { r: number; g: number; b: number } => {
    return {
        r: Number("0x" + input.slice(1, 3)) / (norm ? 255 : 1),
        g: Number("0x" + input.slice(3, 5)) / (norm ? 255 : 1),
        b: Number("0x" + input.slice(5, 7)) / (norm ? 255 : 1)
    };
};

export const colorRGBtoString = (input: {r: number;g: number;b: number;}): string => {
    const r = Math.round(input.r * 255).toString(16);
    const g = Math.round(input.g * 255).toString(16);
    const b = Math.round(input.b * 255).toString(16);
    return `#${r.length == 1 ? "0" : ""}${r}${g.length == 1 ? "0" : ""}${g}${b.length == 1 ? "0" : ""}${b}`;
};

export const randomRange = (min: number, max: number): number => {
    return (max - min) * Math.random() + min;
};

export interface ScaleOverAspect {
    aspect: number;
    interpolate: boolean;
    scaleFactor: number;
}

export interface PositionOverAspect {
    aspect: number;
    interpolate: boolean;
    position: PointData;
}

export const adjustScaleOverAspect = (obj: Container, conf: ScaleOverAspect[]): void => {
    const w = Environment.width;
    const h = Environment.height;
    const aspect = w/h;
    const configs = Object.values(conf);
    if (configs.length == 0) {return}
    if (configs[0].aspect != 0) {throw '[Pixi] Config first item must have aspect = 0'}
    
    let from: ScaleOverAspect;
    let to: ScaleOverAspect | undefined;
    for (let i=0; i<configs.length; i++) {
        if (aspect < configs[i].aspect) {
            from = configs[i-1];
            to = configs[i];
            break;
        }
    }
    if (!from && aspect >= configs[configs.length-1].aspect) {from = configs[configs.length-1];}

    if (from && to && from.interpolate) {
        obj.scale.set(remapClamped(from.scaleFactor, to.scaleFactor, from.aspect, to.aspect, aspect));
    } else {
        obj.scale.set(from.scaleFactor);
    }
}

export const adjustPositionOverAspect = (obj: Container, conf: PositionOverAspect[]): void => {
    const w = Environment.width;
    const h = Environment.height;
    const aspect = w/h;
    const configs = Object.values(conf);
    if (configs.length == 0) {return}
    if (configs[0].aspect != 0) {throw '[Pixi] Config first item must have aspect = 0'}
    
    let from: PositionOverAspect;
    let to: PositionOverAspect | undefined;
    for (let i=0; i<configs.length; i++) {
        if (aspect < configs[i].aspect) {
            from = configs[i-1];
            to = configs[i];
            break;
        }
    }
    if (!from && aspect >= configs[configs.length-1].aspect) {from = configs[configs.length-1];}

    if (from && to && from.interpolate) {
        obj.position.set(
            remapClamped(from.position.x, to.position.x, from.aspect, to.aspect, aspect),
            remapClamped(from.position.y, to.position.y, from.aspect, to.aspect, aspect)
        );
    } else {
        obj.position.copyFrom(from.position);
    }
}

export const threePosToPixiPoint = (parent: Container, pos: Vector3, offset = {x:0, y:0}): PointData => {
    const vector = pos.clone();
    vector.project(Environment.three.cameraController.camera);
    const x = (vector.x + 1) / 2 * Environment.width;
    const y = (1 - vector.y) / 2 * Environment.height;
    
    const point = new Point(x, y);
    const result = parent.toLocal(point);

    result.x += offset.x;
    result.y += offset.y;

    return result;
}

export const getAllMaterials = (object: Object3D): MeshPhysicalMaterial[] => {
    if (!object) {return undefined}

    const result: MeshPhysicalMaterial[] = [];
    object.traverse((child) => {
        if (child instanceof Mesh) {
            if (child.material instanceof MeshPhysicalMaterial) {
                result.push(child.material);
            }
        }
    });
    return result
}

export const asyncTweenMaterialColor = async (to: string, mat: MeshPhysicalMaterial, time: number):  Promise<void> => {
    return new Promise(resolve =>{
        const toObj = colorStringToRGB(to, true);
    
        new Tween(mat.color).to({r: toObj.r, g: toObj.g, b: toObj.b}, time)
            .group(Environment.tweenGroup).easing(Easing.Sinusoidal.InOut).start(Environment.gameTimeMs)
            .onComplete(()=>{resolve()});
    });
}
