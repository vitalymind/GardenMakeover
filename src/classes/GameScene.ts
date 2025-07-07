import { AmbientLight, DirectionalLight, DirectionalLightHelper, HemisphereLight, Mesh, MeshBasicMaterial, Object3D, PCFSoftShadowMap, Scene, SkinnedMesh, SphereGeometry } from "three";
import { GameController } from "./GameController";
import { Environment } from "./Environment";
import { models, textures } from "../loader";
import { staticObjects, StaticObject } from "../generated/staticObjects";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { colorStringToNumber, delay } from "../helpers";
import { CAMERA_FOV_LANDSCAPE, CAMERA_FOV_PORTRAIT, CAMERA_GAMEPLAY_POS, CAMERA_INIT_POS, CAMERA_INTRO_TIME, CAMERA_OFFSET_LANDSCAPE, CAMERA_OFFSET_PORTRAIT, MODEL_CONFIGS } from "../config";
import { ThreeCameraController } from "./ThreeCameraController";



export class GameScene {
    private stage: Scene;
    private skyboxMesh: Mesh;
    private camCtrl: ThreeCameraController;

    trackableObjects: {[id: string]: Object3D} = {}

    private static id = 0;

    constructor(public game: GameController) {
        this.stage = Environment.three.stage;

        //Set camera
        this.camCtrl = Environment.three.cameraController;
        this.camCtrl.setTo( CAMERA_INIT_POS );
        this.camCtrl.setupCamera({far: 1000,near: 1,zoom: 1,fov: 70});

        //Create static objects
        for (const data of staticObjects) {this.makeStaticObject(data)};

        //Setup shadows
        this.setShadow();

        //Create skybox
        this.makeSkybox();

        //Lights
        this.makeLights();

        //Debug
        //this.registerListner();
    }

    private setShadow(): void {
        for (const object of Object.values(this.trackableObjects)) {
            object.traverse((o: Object3D)=>{
                if (o instanceof Mesh || o instanceof SkinnedMesh) {
                    const config = MODEL_CONFIGS[object.name];
                    if (config) {
                        o.castShadow = config.castShadow;
                        o.receiveShadow = config.receiveShadow;
                    } else {
                        o.castShadow = true;
                        o.receiveShadow = false;
                    }
                }
            });
        }
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

    async startCameraMove(): Promise<void> {
        //camCtrl.setTo(CAMERA_GAMEPLAY_POS);
        this.camCtrl.moveTo([CAMERA_GAMEPLAY_POS], CAMERA_INTRO_TIME);
        await delay(CAMERA_INTRO_TIME*1000);
        Environment.events.fire("camera-intro-done");
    }

    private makeLights(): void {
        Environment.three.renderer.shadowMap.enabled = true;
        Environment.three.renderer.shadowMap.type = PCFSoftShadowMap;

        const ambientLight = new HemisphereLight(colorStringToNumber("#fff28d"), colorStringToNumber("#777788"), 2.5);
        this.stage.add(ambientLight);

        const light = new DirectionalLight(colorStringToNumber("#f5ff82"), 1.5);
        light.position.set(-25, 20, -15);
        light.castShadow = true;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        this.stage.add(light);

        const d = 50; // Controls size of visible shadow area
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;

        const helper = new DirectionalLightHelper(light);
        this.stage.add(helper);
    }

    private makeSkybox(): void {
        const geometry = new SphereGeometry( 500, 60, 40 );
        geometry.scale( -1, 1, 1 );
        const material = new MeshBasicMaterial( { map: textures["skybox"]} );
        this.skyboxMesh = new Mesh( geometry, material );
        this.stage.add(this.skyboxMesh);
    }

    resize(): void {
        const w = Environment.width;
        const h = Environment.height;
        const aspect = w/h;
        const handle = this.camCtrl.cameraHandle;
        if (aspect < 1) {
            handle.position.copy(CAMERA_OFFSET_PORTRAIT);
            this.camCtrl.fov = CAMERA_FOV_PORTRAIT;
        } else {
            handle.position.copy(CAMERA_OFFSET_LANDSCAPE);
            this.camCtrl.fov = CAMERA_FOV_LANDSCAPE;
        }
    }

    /*
        DEBUG
    */
   /*
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
    */
}