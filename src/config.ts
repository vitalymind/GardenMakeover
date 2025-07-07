import { Vector3Tuple, Vector4Tuple } from "three";
import { ThreeCameraSnapshot } from "./classes/ThreeCameraController";
import { colorStringToRGB } from "./helpers";
import { GardenBed } from "./classes/GardenBed";
import { Plant } from "./classes/Plant";

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
export const CAMERA_GAMEPLAY_POS: ThreeCameraSnapshot = {p:[3.44,7.321,22.915],r:[-0.455,-0.01,-0.005]};
export const CAMERA_INTRO_TIME = 3;

export const TRANSFORM_BED_LEFT_LANDSCAPE: Transform = {p:[0.15,4.3,19.6048], r:[0,0,0,0], s:[0.7,0.7,0.7]};
export const TRANSFORM_BED_MIDDLE_LANDSCAPE: Transform = {p:[3.3,4.3,19.59], r:[0,-0.9997,0,-0.0236], s:[0.7,0.7,0.7]};
export const TRANSFORM_BED_RIGHT_LANDSCAPE: Transform = {p:[7.0,4.3,19.5762], r:[0,0,0,0], s:[0.7,0.7,0.7]};

export const TRANSFORM_BED_LEFT_PORTRAIT: Transform = {p:[2.0456,4.3,18.3], r:[0,0,0,0], s:[0.7,0.7,0.7]};
export const TRANSFORM_BED_MIDDLE_PORTRAIT: Transform = {p:[3.6349,4.3,20.5], r:[0,0.0089,0,-1], s:[0.5,0.7,0.5]};
export const TRANSFORM_BED_RIGHT_PORTRAIT: Transform = {p:[5.0884,4.3,18.1], r:[0,-0.9978,0,-0.0668], s:[0.7,0.7,0.7]};

export const SEED_COLOR_CORN = [colorStringToRGB("#ffcc00", true), colorStringToRGB("#ffeca0", true)];
export const SEED_COLOR_STRAWBERRY = [colorStringToRGB("#ff7a52", true), colorStringToRGB("#ff9e86", true)];
export const SEED_COLOR_TOMATO = [colorStringToRGB("#e2ffb1", true), colorStringToRGB("#66ff60", true)];
export const SEED_COLOR_GRAPE = [colorStringToRGB("#ffdcfb", true), colorStringToRGB("#f52eff", true)];

export const GARDEN_BED_COLOR_DRY = "#5e1900";
export const GARDEN_BED_COLOR_WET = "#140702";

export type SeedType = "corn" | "grape" | "tomato" | "strawberry";
export const ALL_SEED_TYPES: SeedType[] = ["corn", "grape", "tomato", "strawberry"];

export const UI_SEED_ITEM_POSITION: {[id: number]: number[][]} = {
    1: [[0,0]],
    2: [[-1,0], [1,0]],
    3: [[-0.8, -0.8], [0.8,-0.8],[0,0.8]],
    4: [[-1,-1],[1,-1],[-1,1],[1,1]]
}

export const SEEDING_TIME = 4;
export const WATERING_TIME = 4;
export const TRIMMING_TIME = 4;

export type PlantAction = "water" | "trim";

export interface EventArgs {
    "garden-bed-open-seed-menu": [bed: GardenBed],
    "seed-selected": [seedType: SeedType, bed: GardenBed],
    "pixi-clicked": [],
    "bed-position-changed": [],
    "plant-open-action-menu": [plant: Plant, acttion: PlantAction, cb: ()=>void],
}
export type Events = keyof EventArgs;