import { Container, Sprite } from "pixi.js";
import { GardenBed } from "./GardenBed";
import { adjustScaleOverAspect, delay, ScaleOverAspect, threePosToPixiPoint } from "../helpers";
import { sounds, sprites } from "../loader";
import { ALL_SEED_TYPES, UI_SEED_ITEM_POSITION, SeedType } from "../config";
import { Environment } from "./Environment";
import { Easing, Tween } from "@tweenjs/tween.js";

class SeedItem extends Container {
    private frame: Sprite;
    private item: Sprite;

    isAvailable = true;

    constructor(public type: SeedType) {
        super()

        this.interactive = true;

        this.frame = new Sprite(sprites["item_frame"]);
        this.frame.scale.set(0.5);
        this.frame.anchor.set(0.5);
        this.addChild(this.frame);

        this.item = new Sprite(sprites[type]);
        this.item.scale.set(0.5);
        this.item.anchor.set(0.5);
        this.addChild(this.item);
    }
}

export class SeedSelectWheel {
    root: Container;
    targetBed: GardenBed;
    seedItems: SeedItem[] = [];

    constructor() {
        this.root = new Container();
        this.root.visible = false;

        for (const type of ALL_SEED_TYPES) {
            const seedItem = new SeedItem(type);
            this.seedItems.push(seedItem);
            this.root.addChild(seedItem);
            seedItem.on("pointerdown", ()=>{
                Environment.events.fire("pixi-clicked");
                this.onClick(seedItem);
            });
        }

        Environment.events.on("bed-position-changed", ()=>{this.setPosToBed()});
    }

    private onClick(seedItems: SeedItem): void {
        seedItems.isAvailable = false;
        Environment.events.fire("seed-selected", seedItems.type, this.targetBed);
        sounds["ui_pop"].play();
        this.hide();
    }

    private async hide(): Promise<void> {
        this.root.visible = false;
        for (const seed of this.seedItems) {
            seed.visible = false;

        };
    }

    private setPosToBed(): void {
        if (!this.targetBed) {return} 
        const screenPos = threePosToPixiPoint(this.root.parent, this.targetBed.position);
        this.root.position.copyFrom(screenPos);
    }

    async open(bed: GardenBed): Promise<void> {
        this.targetBed = bed;

        this.setPosToBed();
        this.root.visible = true;

        const availableSeeds = this.seedItems.filter((v)=>{return v.isAvailable});
        
        const positions = UI_SEED_ITEM_POSITION[availableSeeds.length];
        const dist = 130;
        const grp = Environment.tweenGroup;

        for (let i=0; i < availableSeeds.length; i++) {
            const seed = availableSeeds[i];
            seed.visible = true;
            seed.scale.set(0,0);
            seed.position.set(0,0);

            const px = positions[i][0]*dist;
            const py = positions[i][1]*dist;

            new Tween(seed.scale).to({x: 1, y:1}, 350).delay(50).easing(Easing.Back.Out).group(grp).start(Environment.gameTimeMs);
            new Tween(seed.position).to({x: px, y:py}, 250).easing(Easing.Sinusoidal.InOut).group(grp).start(Environment.gameTimeMs);
        }
    }

    resize(): void {
        const config: ScaleOverAspect[] = [
            {aspect: 0, interpolate: true, scaleFactor: 2.5},
            {aspect: 1, interpolate: true, scaleFactor: 1.2},
            {aspect: 3, interpolate: true, scaleFactor: 0.8}
        ];
        adjustScaleOverAspect(this.root, config);
    }
}