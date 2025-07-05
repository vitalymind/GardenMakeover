import { Vector3Tuple, Vector4Tuple } from "three";

export interface StaticObject {
    n: string;
    p: Vector3Tuple;
    r: Vector4Tuple;
    s: Vector3Tuple;
}

export const staticObjects: StaticObject[] = [];

staticObjects.push({n:'terrain', p:[0,0,0], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'barn', p:[-4.4728,4.2624,4.873], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'corn_1', p:[5.5296,4.2438,3.0251], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'corn_1', p:[11.0314,4.2247,1.121], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'corn_1', p:[7.2134,4.3069,9.2435], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'corn_1', p:[3.6642,4.2981,8.3762], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'ground_01', p:[3.6349,4.3671,19.59], r:[0,-0.9997,0,-0.0236], s:[0.666,0.95,0.73]});
staticObjects.push({n:'ground_01', p:[6.8446,4.3656,19.7762], r:[0,-0.9978,0,-0.0668], s:[0.5898,1,0.6988]});
staticObjects.push({n:'ground_01', p:[0.5823,4.3677,19.6048], r:[0,0,0,0], s:[0.6988,0.8269,0.8269]});
staticObjects.push({n:'tree_red', p:[3.0582,4.2102,-0.2904], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'tree_green', p:[9.668,4.1878,-4.6609], r:[0,0,0,0], s:[1,1,1]});
staticObjects.push({n:'tree_green', p:[13.9396,4.163,-0.6893], r:[0,0,0,0], s:[1,1,1]});
