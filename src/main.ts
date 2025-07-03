/// <reference path="./globalTypes.d.ts" />

import { Container, Sprite, Texture, WebGLRenderer as PIXI_WebGLRenderer } from "pixi.js";
import { AmbientLight, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer as THREE_WebGLRenderer } from "three";
import { Group, update as Tween_update } from "@tweenjs/tween.js"
import { Environment } from "./classes/Environment";
import { ThreeCameraController } from "./classes/three/ThreeCameraController";
import { GameController } from "./classes/GameController";
import { loadAssets } from "./loader";

//Debug FPS meter
const debug_showFPS = false;
if (debug_showFPS) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.width = "100%";
    div.style.top = "0px";
    div.style.position = "absolute";
    div.style.justifyContent = "center";
    const span = document.createElement("span");
    div.append(span);
    span.style.color = "white";
    span.id = "debug_fpsMeter";
    span.style.fontSize = "2.6em";
    span.style.textShadow = "3px 3px 9px black";
    span.style.userSelect = "none";
    span.textContent = "144";
    document.body.append(div);
}

export async function main(): Promise<void> {
    /*
        Preapare canvas and rendering context
    */
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const renderContext = canvas.getContext("webgl2", {
        stencil: true,
        antialias: true
    });
    if (!renderContext) {throw "[MAIN]: Unable to make rendering context!";}

    /*
        Preapare Pixi renderer
    */
    Environment.pixi = {
        renderer: new PIXI_WebGLRenderer(),
        stage: new Container()
    }
    await Environment.pixi.renderer.init({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio,
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        eventMode: "static",
        clearBeforeRender: false, //keeps threeJS render output
        canvas: canvas,
        context: renderContext,
        eventFeatures: {
            move: true,
            globalMove: false,
            click: true,
            wheel: true,
        },
    });

    /*
        Prepare Three renderer
    */
    Environment.three = {
        renderer: new THREE_WebGLRenderer({
            canvas: canvas,
            context: renderContext,
            precision: "highp",
            antialias: true,
            alpha: false,
            stencil: true,
            powerPreference: "high-performance",
        }),
        cameraController: new ThreeCameraController(),
        stage: new Scene(),
    }
    Environment.three.renderer.setPixelRatio(window.devicePixelRatio);
    
    /*
        Preaparet Tween
    */
    Environment.tweenGroup = new Group();

    /*
        Loop stages
    */
    const tick = (): void => {
        Environment.gameTimeMs += Environment.deltaTimeMs;

        Environment.tweenGroup.update(Environment.gameTimeMs);
    }

	const render = (): void => {
        Environment.three.renderer.resetState();
        Environment.three.renderer.render(Environment.three.stage, Environment.three.cameraController.camera);

        Environment.pixi.renderer.resetState();
        Environment.pixi.renderer.render({container: Environment.pixi.stage});
    }

    const resize = (): void => {
        const w = Environment.width;
        const h = Environment.height;
        Environment.three.cameraController.resize(w,h);
    }

    /*
        Loop
    */
    let previousTime: number | null;
    const deltaTimes: number[] = [];
    let inited = false;

    const loop = (timeMiliseconds: number): void => {
        /*
            Fps meter and game time
        */
        if (previousTime === undefined || previousTime === null) {previousTime = timeMiliseconds;}
        Environment.deltaTimeMs = timeMiliseconds - previousTime;
        if (debug_showFPS) {
            deltaTimes.push(Environment.deltaTimeMs);
            if (deltaTimes.length >= 20) {
                const avrgDeltaTime = deltaTimes.reduce((a, b) => a + b, 0) / deltaTimes.length;
                Environment.averageFPS = Math.round(1000 / avrgDeltaTime);
                deltaTimes.length = 0;
                /* debug:start */
                const elem = document.getElementById("debug_fpsMeter");
                if (elem) {
                    (elem as HTMLSpanElement).textContent = `${Environment.averageFPS} - ${Math.floor(Environment.gameTimeMs / 1000)}`;
                }
            }
        }

        /*
            Init happen once, after all assets are loaded
        */
        if (!inited) {
            inited = true;

            Environment.gc = new GameController();
            Environment.width = window.innerWidth;
            Environment.height = window.innerHeight;
            resize();
        }

        tick();
        render();

        previousTime = timeMiliseconds;
        window.requestAnimationFrame(loop);
    }

    await loadAssets();

    window.addEventListener("resize", () => {
        if (window.innerWidth == 0 && window.innerHeight > 0) {return}
        Environment.width = window.innerWidth;
        Environment.height = window.innerHeight;
        resize();
    });

    loop(performance.now());
}

main()