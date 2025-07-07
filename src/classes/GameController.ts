import { Mesh, Object3D, Raycaster, SkinnedMesh, Vector2 } from "three";
import { Environment } from "./Environment";
import { GameScene } from "./GameScene";
import { GardenBed } from "./GardenBed";
import { Ui } from "./Ui";
import { PLANTS_NEEDED_TO_GROW } from "../config";
import { sounds } from "../loader";

export class GameController {
    gameScene: GameScene;
    ui: Ui;

    gardenBeds: GardenBed[] = [];
    private boundMousedown: (event: MouseEvent) => void;
    private ray: Raycaster;
    private lastTimePixiClicked = 0;
    private allowClicks = false;
    private grownPlants = 0;
    gameFinished = false;

    private lastPlayed = "";
    private bloops = ["bloop_1","bloop_2","bloop_3"];

    constructor() {
        //Creating scenery
        this.gameScene = new GameScene(this);

        //Create UI
        this.ui = new Ui(this);

        //3D Interactivity
        this.ray = new Raycaster();
        this.boundMousedown = this.mousedown.bind(this);
        window.addEventListener("pointerdown", this.boundMousedown);
        Environment.events.on("pixi-clicked", ()=>{
            this.lastTimePixiClicked = Environment.gameTimeMs;
        });

        //Create garden beds
        this.gardenBeds.push( new GardenBed(this, "left") );
        this.gardenBeds.push( new GardenBed(this, "mid") );
        this.gardenBeds.push( new GardenBed(this, "right") );

        Environment.events.on("camera-intro-done", ()=>{
            this.allowClicks = true;
        });

        Environment.events.on("play-random-bloop-sfx", ()=>{
            this.playRandomBloop();
        });

        Environment.events.on("plant-fully-grown", ()=>{
            this.grownPlants += 1;
            if (this.grownPlants == PLANTS_NEEDED_TO_GROW) {
                this.gameFinished = true;
                this.ui.hideUI();
                this.ui.endScreen.show();
            }
        });
    }

    gameStart(): void {
        this.gameScene.startCameraMove();
        this.ui.unhideScreen();
        sounds["theme"].loop(true);
        sounds["theme"].play();
    }

    private mousedown(event: MouseEvent): void {
        if (!this.allowClicks || this.gameFinished) {return}
        if (event.button == 0) {
            if (Math.round(Environment.gameTimeMs) == Math.round(this.lastTimePixiClicked)) {return}
            const hit = this.raycast(event);
            if (hit && hit.type == "gardenBed") {
                (hit.obj as GardenBed).onClick();
                Environment.events.fire("hide-tutorial");
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

    private playRandomBloop() {
        const available = this.bloops.filter(sound => {return sound !== this.lastPlayed});
        this.lastPlayed = available[Math.floor(Math.random() * available.length)];
        sounds[this.lastPlayed].play();
    }

    update(dt: number): void {
        this.ui.update(dt);
        if (!this.gameFinished) {
            for (const bed of this.gardenBeds) {bed.update(dt)}
        }
    }

    resize(w:number, h:number): void {
        this.gameScene.resize();
        this.ui.resize();
        for (const bed of this.gardenBeds) {bed.resize()};
    }
}