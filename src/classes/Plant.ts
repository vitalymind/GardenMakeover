import { GardenBed } from "./GardenBed";
import { Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { SEEDING_TIME, SeedType, TRIMMING_TIME, WATERING_TIME } from "../config";
import { models } from "../loader";
import { Easing, Tween } from "@tweenjs/tween.js";
import { delay, getAllMaterials } from "../helpers";
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
        if (this.state == "grown") {return}

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
            this.playStage3();
            this.state = "grown";
            this.stateTime = 0;
        }
    }

    async playStage1(): Promise<void> {
        Environment.events.fire("play-random-bloop-sfx");
        await this.showFirstStage();
        await delay(1100);
        this.gardenBed.changeDirtColor("dry");
        await delay(300);
        Environment.events.fire("plant-open-action-menu", this, "water", ()=>{
            this.onWaterring();
        });
    }

    async playStage2(): Promise<void> {
        Environment.events.fire("play-random-bloop-sfx");
        this.hideFirstStage();
        await this.showSecondStage();
        await delay(1100);
        this.gardenBed.showWeeds();
        await delay(800);
        Environment.events.fire("plant-open-action-menu", this, "trim", ()=>{
            this.onTrimming()
        });
    }

    async playStage3(): Promise<void> {
        Environment.events.fire("play-random-bloop-sfx");
        this.hideSecondStage();
        await this.showThirdStage();

        Environment.events.fire("plant-fully-grown", this);
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

    private async showFirstStage(): Promise<void> {
        const obj = this.model_stage_1;
        obj.scale.set(1,0,1);
        obj.visible = true;
        new Tween(obj.scale).to({y:1}, 350).easing(Easing.Back.Out).group(Environment.tweenGroup).start(Environment.gameTimeMs);
        await delay(350);
    }

    private async hideFirstStage(): Promise<void> {
        await this.fadeAsync(this.model_stage_1, 350, true);
    }

    private async showSecondStage(): Promise<void> {
        const obj = this.model_stage_2;
        this.fadeAsync(obj, 250, false);
        obj.visible = true;
        obj.scale.set(1,1,1);
        new Tween(obj.scale).to({y:1.3}, 250).easing(Easing.Quadratic.Out).group(Environment.tweenGroup).start(Environment.gameTimeMs).chain(
            new Tween(obj.scale).to({y:1}, 100).group(Environment.tweenGroup)
        );
        await delay(350);
    }

    private hideSecondStage(): void {
        this.model_stage_2.visible = false;
    }

    private async showThirdStage(): Promise<void> {
        const obj = this.model_stage_3;
        obj.visible = true;
        obj.scale.set(1,1,1);
        new Tween(obj.scale).to({y:1.3}, 250).easing(Easing.Quadratic.Out).group(Environment.tweenGroup).start(Environment.gameTimeMs).chain(
            new Tween(obj.scale).to({y:1}, 100).group(Environment.tweenGroup)
        );
        await delay(350);
    }

    private async fadeAsync(obj: Object3D, time: number, hide: boolean): Promise<void> {
        const allMats = getAllMaterials(obj);
        for (const mat of allMats) {
            mat.transparent = true;
            mat.opacity = hide ? 1 : 0;
            new Tween(mat).to({opacity: (hide ? 0 : 1)}, time).group(Environment.tweenGroup).start(Environment.gameTimeMs);
        }

        await delay(time);
    }
}