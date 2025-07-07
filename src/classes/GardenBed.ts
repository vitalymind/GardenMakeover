import { GameController } from "./GameController";

import {
    TRANSFORM_BED_LEFT_LANDSCAPE,
    TRANSFORM_BED_MIDDLE_LANDSCAPE,
    TRANSFORM_BED_RIGHT_LANDSCAPE,
    TRANSFORM_BED_LEFT_PORTRAIT,
    TRANSFORM_BED_MIDDLE_PORTRAIT,
    TRANSFORM_BED_RIGHT_PORTRAIT,
    Transform,
    SEED_COLOR_CORN,
    SEED_COLOR_STRAWBERRY,
    SEED_COLOR_TOMATO,
    SEED_COLOR_GRAPE,
    SeedType,
    GARDEN_BED_COLOR_DRY,
    GARDEN_BED_COLOR_WET
} from "../config";
import { Mesh, MeshPhysicalMaterial, Object3D } from "three";
import { models } from "../loader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Environment } from "./Environment";
import { Easing, Tween } from "@tweenjs/tween.js";
import { asyncTweenMaterialColor, colorStringToRGB, delay, getAllMaterials, randomRange } from "../helpers";
import { createParticleSystem, ParticleSystem } from "@newkrok/three-particles";
import seeds_fall from "../assets/particles/seeds_fall.json";
import water_bucket from "../assets/particles/water_bucket.json";
import { Plant } from "./Plant";

type BedPos = "left"|"mid"|"right";

export class GardenBed extends Object3D {
    private transformMode: "landscape" | "portrait" | "none" = "none";

    plant: Plant | undefined;

    bedObject: Object3D;
    private seedBag: Object3D;
    private bucket: Object3D;
    private hoe: Object3D;
    private weeds: Object3D[] = [];
    private seedsEmitter: ParticleSystem;
    private waterEmitter: ParticleSystem;

    constructor(public game: GameController, public bedPos:BedPos) {
        super();
        Environment.three.stage.add(this);

        this.bedObject = clone(models["garden_bed"].scene);
        this.bedObject.name = `bed_${bedPos}`;
        this.add(this.bedObject);

        //Make sure materail unique per bed
        this.bedObject.traverse(o=>{
            if (o instanceof Mesh && o.material instanceof MeshPhysicalMaterial) {
                o.material = o.material.clone();
            }
        })

        this.seedBag = clone(models["seed_bag"].scene);
        this.seedBag.name = `bag_${bedPos}`;
        this.seedBag.visible = false;
        this.add(this.seedBag);

        this.bucket = clone(models["bucket"].scene);
        this.bucket.visible = false;
        this.add(this.bucket);

        this.hoe = clone(models["hoe"].scene);
        this.hoe.visible = false;
        const hoeHolder = new Object3D();
        this.add(hoeHolder);
        hoeHolder.add(this.hoe);
        hoeHolder.rotateY(Math.PI*1.2);
        for (let i=0; i<3; i++) {
            const weed = clone(models["grass_02"].scene);
            weed.position.set(
                randomRange(-0.4,0.4),
                0.1,
                randomRange(-0.4,0.4),
            );
            weed.rotateY(Math.PI * i * 0.7);
            weed.visible = false;
            this.add(weed);
            this.weeds.push(weed);
        }

        Environment.events.on("seed-selected", (type:SeedType, bed: GardenBed)=>{
            if (bed !== this) {return}
            if (this.plant) {return}
            this.placeSeed(type);
        });
        
        this.resize();
    }

    placeSeed(type:SeedType): void {
        this.playSeedBagAnimation(type);
        this.plant = new Plant(this, type);
    }

    changeDirtColor(color: "dry" | "wet", time = 350) : void {
        const mats = getAllMaterials(this.bedObject);
        for (const mat of mats) {
            asyncTweenMaterialColor((color == "dry" ? GARDEN_BED_COLOR_DRY : GARDEN_BED_COLOR_WET), mat, time);
        }
    }

    async startWaterring(): Promise<void> {
        this.playWaterBucketAnimation();
        await delay(700);
        this.changeDirtColor("wet", 1800);
    }

    private async popWeed(index: number, hide: boolean): Promise<void> {
        const weed = this.weeds[index];
        weed.scale.set(1,(hide ? 1 : 0),1);
        weed.visible = true;
        new Tween(weed.scale).to({y:(hide ? 0 : 1)}, 350).easing(Easing.Back.Out).group(Environment.tweenGroup).start(Environment.gameTimeMs);
    }

    async showWeeds(): Promise<void> {
        for (let i=0; i<this.weeds.length;i++) {
            this.popWeed(i, false);
            await delay(Math.random() * 150 + 50);
        }
        
    }

    async startTrimming(): Promise<void> {
        this.playHoeAnimation();
    }

    private async playSeedBagAnimation(type: SeedType): Promise<void> {
        const bag = this.seedBag;
        const grp = Environment.tweenGroup;

        bag.position.set(1,2.1,-0.5);
        bag.scale.set(0,0,0);
        bag.visible = true;

        //Scale
        new Tween(bag.scale).to({x:1,y:1,z:1}, 350).easing(Easing.Back.Out).group(grp).chain(
            new Tween(bag.scale).to({x:0,y:0,z:0}, 350).delay(1600).easing(Easing.Back.In).group(grp)
        ).start(Environment.gameTimeMs);

        //Side
        new Tween(bag.position).to({x:0}, 900).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).chain(
        ).start(Environment.gameTimeMs);

        //Height
        new Tween(bag.position).to({y:3}, 350).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).chain(
            new Tween(bag.position).to({y:1.5}, 1500).easing(Easing.Sinusoidal.InOut).group(grp).chain(
            )
        ).start(Environment.gameTimeMs);

        //Rotation
        new Tween(bag.rotation).to({z: Math.PI*0.8}, 1000).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).start(Environment.gameTimeMs)


        await delay(500);
        this.playSeedVFX(type);
        
        //Seeds
        
        await delay(1600 + 350);

        bag.rotation.set(0,0,0);
        bag.visible = false;
    }

    private async playWaterBucketAnimation(): Promise<void> {
        const buc = this.bucket;
        const grp = Environment.tweenGroup;

        buc.position.set(-1,2.3,0);
        buc.scale.set(0,0,0);
        buc.visible = true;

        //Scale
        new Tween(buc.scale).to({x:1.5,y:1.5,z:1.5}, 350).easing(Easing.Back.Out).group(grp).chain(
            new Tween(buc.scale).to({x:0,y:0,z:0}, 350).delay(1600).easing(Easing.Back.In).group(grp)
        ).start(Environment.gameTimeMs);

        //Side
        new Tween(buc.position).to({x:0}, 900).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).chain(
        ).start(Environment.gameTimeMs);

        //Height
        new Tween(buc.position).to({y:3}, 350).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).chain(
            new Tween(buc.position).to({y:2.7}, 1500).easing(Easing.Sinusoidal.InOut).group(grp).chain(
            )
        ).start(Environment.gameTimeMs);

        //Rotation
        new Tween(buc.rotation).to({z: -Math.PI*0.8}, 1000).delay(250).easing(Easing.Sinusoidal.InOut).group(grp).start(Environment.gameTimeMs)

        await delay(350);
        this.playWaterVFX();
    }

    private async playHoeAnimation(): Promise<void> {
        const hoe = this.hoe;
        const grp = Environment.tweenGroup;

        hoe.position.set(
            randomRange(0,-0.5),
            0.3,
            randomRange(-1.9,-2.1),
        );

        this.hoe.rotateX(Math.PI*0.25);

        //Scale
        new Tween(hoe.scale).to({x:1,y:1,z:1}, 350).easing(Easing.Back.Out).group(grp).chain(
            new Tween(hoe.scale).to({x:0,y:0,z:0}, 350).delay(1600).easing(Easing.Back.In).group(grp)
        ).start(Environment.gameTimeMs);

        //Hit Ground
        for (let i=0; i<this.weeds.length; i++) {
            new Tween(hoe.rotation).to({x: Math.PI*0.5}, 350).delay(250 + ((350+250)* i)).easing(Easing.Cubic.In).group(grp).start(Environment.gameTimeMs).chain(
                new Tween(hoe.rotation).to({x: Math.PI*0.25}, 250).easing(Easing.Cubic.Out).group(grp)
            ).onComplete(()=>{
                this.popWeed(i, true);
            })
        }

        
        hoe.scale.set(0,0,0);
        hoe.visible = true;
    }

    private playSeedVFX(type: SeedType): void {
        if (type == "corn") {
            seeds_fall.startColor.min = SEED_COLOR_CORN[0];
            seeds_fall.startColor.max = SEED_COLOR_CORN[1];
        } else if (type == "grape") {
            seeds_fall.startColor.min = SEED_COLOR_GRAPE[0];
            seeds_fall.startColor.max = SEED_COLOR_GRAPE[1];
        } else if (type == "strawberry") {
            seeds_fall.startColor.min = SEED_COLOR_STRAWBERRY[0];
            seeds_fall.startColor.max = SEED_COLOR_STRAWBERRY[1];
        } else if (type == "tomato") {
            seeds_fall.startColor.min = SEED_COLOR_TOMATO[0];
            seeds_fall.startColor.max = SEED_COLOR_TOMATO[1];
        }
        //@ts-ignore
        this.seedsEmitter = createParticleSystem(seeds_fall);
        this.add(this.seedsEmitter.instance);
    }

    private playWaterVFX(): void {
        water_bucket.startColor.min = colorStringToRGB("#001eff");
        water_bucket.startColor.max = colorStringToRGB("#6dfff0");

        //@ts-ignore
        this.waterEmitter = createParticleSystem(water_bucket);
        this.add(this.waterEmitter.instance);
    }

    private setTransform(transform: Transform): void {
        this.position.set(...transform.p);
        this.bedObject.scale.set(...transform.s);
        this.bedObject.quaternion.set(...transform.r);
    }

    onClick(): void {
        if (this.plant == undefined) {
            Environment.events.fire("garden-bed-open-seed-menu", this);
        }
    }

    update(dt: number): void {
        if (this.seedsEmitter) {
            this.seedsEmitter.instance.position.copy(this.seedBag.position);
        }

        if (this.waterEmitter) {
            const pos = this.bucket.position.clone().add({x:0,y:-0.3, z:-0.5});
            this.waterEmitter.instance.position.copy(pos);
        }

        if (this.plant) {
            this.plant.update(dt);
        }
    }

    resize(): void {
        const aspect = Environment.width/Environment.height;

        if (aspect <= 1) {
            if (this.transformMode != "portrait") {
                this.transformMode = "portrait";
                this.setTransform(
                    this.bedPos == "left" ? TRANSFORM_BED_LEFT_PORTRAIT :
                    this.bedPos == "mid" ? TRANSFORM_BED_MIDDLE_PORTRAIT :
                    TRANSFORM_BED_RIGHT_PORTRAIT
                )
            }
        } else {
            if (this.transformMode != "landscape") {
                this.transformMode = "landscape";
                this.setTransform(
                    this.bedPos == "left" ? TRANSFORM_BED_LEFT_LANDSCAPE :
                    this.bedPos == "mid" ? TRANSFORM_BED_MIDDLE_LANDSCAPE :
                    TRANSFORM_BED_RIGHT_LANDSCAPE
                )
            }
        }

        if (this.plant) {
            this.plant.resize();
        }

        Environment.events.fire("bed-position-changed");
    }
}