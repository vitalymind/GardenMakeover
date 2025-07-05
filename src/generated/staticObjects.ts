import { Vector3Tuple, Vector4Tuple } from "three";

export interface StaticObject {
    n: string;
    p: Vector3Tuple;
    r: Vector4Tuple;
    s: Vector3Tuple;
}

export const staticObjects: StaticObject[] = [];

staticObjects.push({n:'barn', p:[0.9178,4.755,-7.659], r:[0.4785,0.2675,-0.0659,0.8337], s:[1.8292,1.21,1.5467]});
