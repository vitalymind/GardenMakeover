import { Group } from "@tweenjs/tween.js";
import { Container, WebGLRenderer as PIXI_WebGLRenderer } from "pixi.js";
import { Scene, WebGLRenderer as THREE_WebGLRenderer } from "three";
import { ThreeCameraController } from "./ThreeCameraController";
import { GameController } from "./GameController";

interface Pixi {
    renderer: PIXI_WebGLRenderer;
    stage: Container;
}

interface Three {
    renderer: THREE_WebGLRenderer;
    cameraController: ThreeCameraController;
    stage: Scene;
}

export class Environment {
    static deltaTimeMs: number = 0;
    static averageFPS: number = 0;
    static gameTimeMs: number = 0;

    static width: number;
    static height: number;

    static pixi: Pixi;
    static three: Three;

    static tweenGroup: Group;

    static gc: GameController;
}
window.env = Environment;