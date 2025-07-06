import { Vector3Tuple, Vector4Tuple } from "three";
import { ThreeCameraSnapshot } from "./classes/ThreeCameraController";
import { colorStringToRGB } from "./helpers";

interface ModelConfig {
    castShadow: boolean;
    receiveShadow: boolean;
}
export const MODEL_CONFIGS: {[id: string]: ModelConfig} = {};
MODEL_CONFIGS["terrain"] = {
    castShadow: false,
    receiveShadow: true,
}
MODEL_CONFIGS["stone"] = {
    castShadow: false,
    receiveShadow: true,
}
MODEL_CONFIGS["hill"] = {
    castShadow: false,
    receiveShadow: true,
}

export interface Transform {
    p: Vector3Tuple;
    r: Vector4Tuple;
    s: Vector3Tuple;
}

export const CAMERA_INIT_POS: ThreeCameraSnapshot = {p:[3.526,8.053,22.651],r:[0.249,-0.06,0.015]};
export const CAMERA_GAMEPLAY_POS: ThreeCameraSnapshot = {p:[3.689,7.321,22.918],r:[-0.455,-0.01,-0.005]};
export const CAMERA_INTRO_TIME = 3;

export const TRANSFORM_BED_LEFT_LANDSCAPE: Transform = {p:[0.5823,4.3677,19.6048], r:[0,0,0,0], s:[0.7,0.7,0.7]};
export const TRANSFORM_BED_MIDDLE_LANDSCAPE: Transform = {p:[3.6349,4.3671,19.59], r:[0,-0.9997,0,-0.0236], s:[0.7,0.7,0.7]};
export const TRANSFORM_BED_RIGHT_LANDSCAPE: Transform = {p:[7.1446,4.3656,19.5762], r:[0,0,0,0], s:[0.7,0.7,0.7]};

export const TRANSFORM_BED_LEFT_PORTRAIT: Transform = {p:[3.6349,4.3671,21.1511], r:[0,0.0089,0,-1], s:[0.5579,0.95,0.4883]};
export const TRANSFORM_BED_MIDDLE_PORTRAIT: Transform = {p:[5.0884,4.3656,18.7062], r:[0,-0.9978,0,-0.0668], s:[0.5898,1,0.6988]};
export const TRANSFORM_BED_RIGHT_PORTRAIT: Transform = {p:[2.0456,4.3677,18.5032], r:[0,0,0,0], s:[0.6988,0.8269,0.8269]};

export const SEED_COLOR_CORN = [colorStringToRGB("#ffcc00", true), colorStringToRGB("#ffeca0", true)];
export const SEED_COLOR_STRAWBERRY = [colorStringToRGB("#ff7a52", true), colorStringToRGB("#ff9e86", true)];
export const SEED_COLOR_TOMATO = [colorStringToRGB("#e2ffb1", true), colorStringToRGB("#66ff60", true)];
export const SEED_COLOR_GRAPE = [colorStringToRGB("#ffdcfb", true), colorStringToRGB("#f52eff", true)];