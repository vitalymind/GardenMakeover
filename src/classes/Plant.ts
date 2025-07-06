import { GardenBed } from "./GardenBed";
import { Material, Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { SEEDING_TIME, SeedType, TRIMMING_TIME, WATERING_TIME } from "../config";
import { models } from "../loader";
import { Tween } from "@tweenjs/tween.js";
import { fadeMaterialAsync, getAllMaterials } from "../helpers";
import { Environment } from "./Environment";

export class Plant {
    private state: "seeding" | "watering" | "trimming" | "grown" = "seeding";
    private stateTime = 0;
    private waitInput = false;

    private model_stage_1: Object3D;
    private model_stage_2: Object3D;
    private model_stage_3: Object3D;

    constructor(public gardenBed: GardenBed, private type: SeedType) {
        for (let i=1; i<=3; i++) {
            this[`model_stage_${i}`] = clone(models[`${type}_${i}`].scene);
            const model = this[`model_stage_${i}`];
            model.visible = false;
            gardenBed.add(model);
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
            Environment.events.fire("plant-open-action-menu", this, "water", ()=>{
                this.onWaterring();
            });
            this.growAnimation(undefined, this.model_stage_1);

        } else if (this.state == "watering" && this.stateTime >= WATERING_TIME) {
            this.state = "trimming";
            this.stateTime = 0;
            this.waitInput = true;
            this.model_stage_2.visible = true;
            Environment.events.fire("plant-open-action-menu", this, "trim", ()=>{
                this.onTrimming()
            });
        } else if (this.state == "trimming" && this.stateTime >= TRIMMING_TIME) {
            this.model_stage_3.visible = true;
            this.state = "grown";
        }
    }

    private async onWaterring(): Promise<void> {
        this.waitInput = false;
    }

    private async onTrimming(): Promise<void> {
        this.waitInput = false;
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