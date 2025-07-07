import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { Environment } from "./Environment";
import { sprites } from "../loader";
import { Easing, Tween } from "@tweenjs/tween.js";
import { PlantAction } from "../config";
import { Plant } from "./Plant";
import { adjustScaleOverAspect, ScaleOverAspect, threePosToPixiPoint } from "../helpers";

export class PlantActionMenu extends Container {
    private frame: Sprite;
    private item: Sprite;

    isAvailable = true;
    toBeRemoved = false;

    constructor(private plant: Plant, action: PlantAction, private cb: ()=>void) {
        super()

        this.scale.set(0);

        this.frame = new Sprite(sprites["item_frame"]);
        this.frame.scale.set(0.5);
        this.frame.anchor.set(0.5);
        this.addChild(this.frame);

        this.item = new Sprite(sprites[ (action == "water" ? "bucket" : "hoe") ]);
        this.item.scale.set(0.5);
        this.item.anchor.set(0.5);
        this.addChild(this.item);
    }

    show(): void {
        this.setPosToBed();
        new Tween(this.scale).to({x: 1, y:1}, 350).easing(Easing.Back.Out)
            .group(Environment.tweenGroup)
            .start(Environment.gameTimeMs)
            .onComplete(()=>{
            this.interactive = true;
            this.on("pointerdown", ()=>{
                this.interactive = false;
                this.cb();
                this.hide();
            });
        });
    }

    private setPosToBed(): void {
        if (!this.plant) {return}
        const pos = this.plant.gardenBed.position.clone();
        pos.y += 2;
        const screenPos = threePosToPixiPoint(this.parent, pos);
        this.position.copyFrom(screenPos);
    }

    private hide(): void {
        new Tween(this.scale).to({x: 0, y:0}, 350).easing(Easing.Back.In)
            .group(Environment.tweenGroup)
            .start(Environment.gameTimeMs)
            .onComplete(()=>{
                this.toBeRemoved = true;
            });
    }

    resize(): void {
        const w = Environment.width;
        const h = Environment.height;
        const aspect = w/h;

        this.setPosToBed();

        const config: ScaleOverAspect[] = [
            {aspect: 0, interpolate: true, scaleFactor: 2.5},
            {aspect: 1, interpolate: true, scaleFactor: 1.1},
            {aspect: 2, interpolate: true, scaleFactor: 0.8}
        ]
        adjustScaleOverAspect(this, config);
    }
}