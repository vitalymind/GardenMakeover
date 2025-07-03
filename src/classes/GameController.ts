import { AmbientLight, BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { Environment } from "./Environment";
import { Sprite } from "pixi.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { models, sprites } from "../loader";

export class GameController {
    constructor() {
        this.threeTest();
        this.pixiTest();
    }

    update(dt: number): void {

    }

    threeTest(): void {
        const stage = Environment.three.stage;

        const sheepGltf = models["object2"];
        const copy = clone(sheepGltf.scene);
        copy.position.set(0,-25, 0);
        stage.add(copy);

        const geometry = new BoxGeometry( 10, 10, 10 );
        const material = new MeshBasicMaterial( { color: Math.floor(Math.random()*16777216) } );
        const mesh = new Mesh( geometry, material );
        stage.add(mesh);
        const ambientLight = new AmbientLight(0xffffff, 1);
        stage.add(ambientLight);

        const camCtrl = Environment.three.cameraController;
        camCtrl.setupCamera({far: 2000, near: 1, zoom :1, fov: 70});
        camCtrl.camera.position.set(0,0,50);
    }

    pixiTest(): void {
        const stage = Environment.pixi.stage;
        console.log(sprites["tomato"])
        const test = new Sprite(sprites["tomato"]);
        test.scale.set(1,1);
        test.position.set(300,300)
        stage.addChild(test);
    }
}