import { Mesh, Object3D, Raycaster, SkinnedMesh, Vector2 } from "three";
import { CAMERA_GAMEPLAY_POS, CAMERA_INTRO_TIME } from "../config";
import { r3, remapClamped } from "../helpers";
import { Environment } from "./Environment";
import { GameScene } from "./GameScene";
import { GardenBed } from "./GardenBed";

export class GameController {
    gameScene: GameScene;
    gardenBeds: GardenBed[] = [];
    private boundMousedown: (event: MouseEvent) => void;

    private ray: Raycaster;

    constructor() {
        //Creating scenery
        this.gameScene = new GameScene(this);

        //Raycast
        this.ray = new Raycaster();
        this.boundMousedown = this.mousedown.bind(this);
        window.addEventListener("pointerdown", this.boundMousedown);

        //Create garden beds
        this.gardenBeds.push( new GardenBed(this, "left") );
        this.gardenBeds.push( new GardenBed(this, "mid") );
        this.gardenBeds.push( new GardenBed(this, "right") );
    }

    gameStart(): void {
        const camCtrl = Environment.three.cameraController;

        camCtrl.setTo(CAMERA_GAMEPLAY_POS);
        //camCtrl.moveTo([CAMERA_GAMEPLAY_POS], CAMERA_INTRO_TIME);
    }

    private mousedown(event: MouseEvent): void {
        if (event.button == 0) {
            const hit = this.raycast(event);
            
            if (hit && hit.type == "gardenBed") {
                const bed = hit.obj as GardenBed;
                bed.playSeedBagAnimation();
            }
        }
    }

    private raycast(event: MouseEvent): {obj: Object3D, type: "gardenBed" | "cow"} | undefined {
        const point = new Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        this.ray.setFromCamera(point, Environment.three.cameraController.camera);
        const intersects = this.ray.intersectObjects(Environment.three.stage.children, true);
        for (const hit of intersects) {
            const obj = hit.object;
            if (obj instanceof Mesh || obj instanceof SkinnedMesh) {
                let interactive: Object3D;
                obj.traverseAncestors(o => {
                    if (o instanceof GardenBed) {interactive = o}
                });
                if (interactive) {return {obj: interactive, type: "gardenBed"}}
            }
        }
        return undefined;
    }

    update(dt: number): void {
        for (const bed of this.gardenBeds) {bed.update(dt)}
    }

    resize(w:number, h:number): void {
        const aspect = w/h
        const camCtrl = Environment.three.cameraController;
        if (w > h) {
            camCtrl.fov = remapClamped(90,55,1,3,aspect);
        } else {
            camCtrl.fov = remapClamped(90,60,0,1,aspect);
        }

        for (const bed of this.gardenBeds) {bed.resize()}

        console.log(`FOV: ${r3(camCtrl.fov)}`);
    }
}