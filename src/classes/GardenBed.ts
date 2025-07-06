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
    SeedType
} from "../config";
import { Object3D } from "three";
import { models } from "../loader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Environment } from "./Environment";
import { Easing, Tween } from "@tweenjs/tween.js";
import { delay } from "../helpers";
import { createParticleSystem, ParticleSystem } from "@newkrok/three-particles";
import seeds_fall from "../assets/particles/seeds_fall.json";
import { Plant } from "./Plant";

type BedPos = "left"|"mid"|"right";

export class GardenBed extends Object3D {
    private transformMode: "landscape" | "portrait" | "none" = "none";

    plant: Plant | undefined;

    bedObject: Object3D;
    private seedBag: Object3D;
    private seedsEmitter: ParticleSystem;

    constructor(public game: GameController, private bedPos:BedPos) {
        super();
        Environment.three.stage.add(this);

        this.bedObject = clone(models["garden_bed"].scene);
        this.bedObject.name = `bed_${bedPos}`;
        this.add(this.bedObject);

        this.seedBag = clone(models["seed_bag"].scene);
        this.seedBag.name = `bag_${bedPos}`;
        this.seedBag.visible = false;
        this.add(this.seedBag);

        Environment.events.on("seed-selected", (type:SeedType, bed: GardenBed)=>{
            if (bed !== this) {return}
            if (this.plant) {return}

            this.playSeedBagAnimation(type);
            this.plant = new Plant(this, type);
        });
        
        this.resize();
    }

    private setTransform(transform: Transform): void {
        this.position.set(...transform.p);
        this.bedObject.scale.set(...transform.s);
        this.bedObject.quaternion.set(...transform.r);
    }

    async playSeedBagAnimation(type: SeedType): Promise<void> {
        const bag = this.seedBag;
        const grp = Environment.tweenGroup;

        bag.position.set(1,2.5,-0.5);
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


        await delay(150);
        this.playSeedVFX(type);
        
        //Seeds
        
        await delay(1600 + 350 + 350);

        bag.rotation.set(0,0,0);
        bag.visible = false;
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

    onClick(): void {
        if (this.plant == undefined) {
            Environment.events.fire("garden-bed-open-seed-menu", this);
        }
    }

    update(dt: number): void {
        if (this.seedsEmitter) {
            this.seedsEmitter.instance.position.copy(this.seedBag.position);
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

        Environment.events.fire("bed-position-changed");
    }
}