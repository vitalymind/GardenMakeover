import { GardenBed } from "./GardenBed";
import { Material, Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { SEEDING_TIME, SeedType, TRIMMING_TIME, WATERING_TIME } from "../config";
import { models } from "../loader";
import { Tween } from "@tweenjs/tween.js";
import { delay, fadeMaterialAsync, getAllMaterials } from "../helpers";
import { Environment } from "./Environment";

export class Plant {
    private state: "seeding" | "watering" | "trimming" | "grown" = "seeding";
    private stateTime = 0;
    private waitInput = false;

    root: Object3D;

    private model_stage_1: Object3D;
    private model_stage_2: Object3D;
    private model_stage_3: Object3D;

    constructor(public gardenBed: GardenBed, private type: SeedType) {
        this.root = new Object3D();
        this.setViewScale();
        gardenBed.add(this.root);

        for (let i=1; i<=3; i++) {
            this[`model_stage_${i}`] = clone(models[`${type}_${i}`].scene);
            const model = this[`model_stage_${i}`];
            model.visible = false;
            this.root.add(model);
        }
    }

    private setViewScale(): void {
        const portrait = Environment.width/Environment.height < 1;
        if (portrait && this.gardenBed.bedPos == "mid") {
            this.root.scale.set(0.6,0.6,0.6);
        } else {
            this.root.scale.set(0.8,0.8,0.8);
        }
    }

    update(dt: number): void {
        if (!this.waitInput) {
            this.stateTime += dt;
        }

        //Simple fsm
        if (this.state == "seeding" && this.stateTime >= SEEDING_TIME) {
            this.state = "watering";
            this.stateTime = 0;
            this.waitInput = true;
            this.playStage1();
        } else if (this.state == "watering" && this.stateTime >= WATERING_TIME) {
            this.state = "trimming";
            this.stateTime = 0;
            this.waitInput = true;
            this.playStage2();
        } else if (this.state == "trimming" && this.stateTime >= TRIMMING_TIME) {
            this.model_stage_3.visible = true;
            this.state = "grown";
        }
    }

    async playStage1(): Promise<void> {
        await this.growAnimation(undefined, this.model_stage_1);
        await delay(1100);
        this.gardenBed.changeDirtColor("dry");
        await delay(300);
        Environment.events.fire("plant-open-action-menu", this, "water", ()=>{
            this.onWaterring();
        });
    }

    async playStage2(): Promise<void> {
        await this.growAnimation(this.model_stage_1, this.model_stage_2);
        await delay(1100);
        this.gardenBed.showWeeds();
        await delay(800);
        Environment.events.fire("plant-open-action-menu", this, "trim", ()=>{
            this.onTrimming()
        });
    }

    resize(): void {
        this.setViewScale();
    }

    private async onWaterring(): Promise<void> {
        this.waitInput = false;
        this.gardenBed.startWaterring();
    }
    
    private async onTrimming(): Promise<void> {
        this.waitInput = false;
        this.gardenBed.startTrimming();
    }

    async growAnimation(prevModel: Object3D, newModel: Object3D | undefined): Promise<void> {
        const grp = Environment.tweenGroup;

        //Hide current model
        if (prevModel) {
            const promises: Promise<void>[] = [];
            const allMats = getAllMaterials(prevModel);
            for (const mat of allMats) {
                mat.transparent = true;
                mat.opacity = 0;
                promises.push(fadeMaterialAsync(mat, 350, true));
            }
            (Promise.all(promises)).then(()=>{
                prevModel.visible = false;
            });
        }

         if (newModel) {
            const allMats = getAllMaterials(newModel);
            newModel.visible = true;
            for (const mat of allMats) {
                mat.transparent = true;
                mat.opacity = 0;
                fadeMaterialAsync(mat, 350, false);
            }
        }

        //newModel.visible = true;
    }
}