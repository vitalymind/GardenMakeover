import { AmbientLight, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from "three";
import { GameController } from "./GameController";
import { Environment } from "./Environment";
import { models, textures } from "../loader";
import { staticObjects, StaticObject } from "../generated/staticObjects";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export class GameScene {
    private stage: Scene;
    private skyboxMesh: Mesh;

    trackableObjects: {[id: string]: Object3D} = {}

    private static id = 0;

    constructor(public game: GameController) {
        this.stage = Environment.three.stage;

        //Set camera
        Environment.three.cameraController.setTo( {p:[3.552,7.194,24.122],r:[-0.378,-0.007,-0.003]} );
        Environment.three.cameraController.setupCamera({
            far: 1000,
            near: 0.1,
            zoom: 1,
            fov: 70
        });

        //Create static objects
        for (const data of staticObjects) {this.makeStaticObject(data)};

        //Create skybox
        this.makeSkybox();

        //Lights
        this.makeLights();

        //Debug
        this.registerListner();
    }

    makeStaticObject(data: StaticObject): void {
        if (!models[data.n]) {
            throw `[Runtime]: Error, model: ${data.n} is not loaded`;
        }

        const object = clone(models[data.n].scene);
        object.position.set(...data.p);
        object.scale.set(...data.s);
        object.quaternion.set(...data.r);
        object.name = data.n;

        this.trackableObjects[`${data.n}_${GameScene.id++}`] = object;
        this.stage.add(object);
    }

    private makeLights(): void {
        const ambientLight = new AmbientLight(0xffffff, 2);
        this.stage.add(ambientLight);
    }

    private makeSkybox(): void {
        const geometry = new SphereGeometry( 500, 60, 40 );
        geometry.scale( -1, 1, 1 );
        const material = new MeshBasicMaterial( { map: textures["skybox_resting_place"]} );
        this.skyboxMesh = new Mesh( geometry, material );
        this.stage.add(this.skyboxMesh);
    }

    /*
        DEBUG
    */
    private registerListner(): void {
        window.addEventListener("keydown", (event: KeyboardEvent)=>{
            if (event.shiftKey && event.code == "KeyS") {
                this.debugSaveStaticObjects();
                event.preventDefault();
            }
        });
    }

    private async debugSaveStaticObjects(): Promise<void> {
        const data: StaticObject[] = [];
        for (const object of Object.values(this.trackableObjects)) {
            data.push({
                n:object.name,
                p: object.position.toArray(),
                r: object.quaternion.toArray(),
                s: object.scale.toArray()
            });
        }

        console.log("Saving static objects...");

        const res = await fetch("/saveStaticObjects", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        if (res.status == 200) {
            console.log("Saved");
        } else{
            console.log("Error");
        }
    }
}