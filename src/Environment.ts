import { Container, WebGLRenderer as PIXI_WebGLRenderer } from "pixi.js";
import { PerspectiveCamera, Scene, WebGLRenderer as THREE_WebGLRenderer } from "three";

interface Pixi {
    renderer: PIXI_WebGLRenderer;
    stage: Container;
}

interface Three {
    renderer: THREE_WebGLRenderer;
    camera: PerspectiveCamera;
    stage: Scene;
}

export class Environment {
    static deltaTimeMs: number = 0;
    static averageFPS: number = 0;
    static gameTimeMs: number = 0;

    static pixi: Pixi;
    static three: Three;
}
window.env = Environment;