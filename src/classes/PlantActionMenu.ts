import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { Environment } from "./Environment";
import { sounds, sprites } from "../loader";
import { Easing, Tween } from "@tweenjs/tween.js";
import { PlantAction } from "../config";
import { Plant } from "./Plant";
import { adjustScaleOverAspect, delay, ScaleOverAspect, threePosToPixiPoint } from "../helpers";

export class PlantActionMenu extends Container {
    private holder: Container;
    private frame: Sprite;
    private item: Sprite;

    isAvailable = true;
    toBeRemoved = false;

    constructor(private plant: Plant, action: PlantAction, private cb: ()=>void) {
        super();

        this.holder = new Container();
        this.holder.scale.set(0);
        this.addChild(this.holder);

        this.frame = new Sprite(sprites["item_frame"]);
        this.frame.scale.set(0.5);
        this.frame.anchor.set(0.5);
        this.holder.addChild(this.frame);

        this.item = new Sprite(sprites[ (action == "water" ? "bucket" : "hoe") ]);
        this.item.scale.set(0.5);
        this.item.anchor.set(0.5);
        this.holder.addChild(this.item);

        Environment.events.on("bed-position-changed", ()=>{this.setPosToBed()});
    }

    show(): void {
        this.setPosToBed();
        this.resize();

        new Tween(this.holder.scale).to({x: 1, y:1}, 350).easing(Easing.Back.Out)
            .group(Environment.tweenGroup)
            .start(Environment.gameTimeMs)
            .onComplete(()=>{
                this.interactive = true;
                this.on("pointerdown", ()=>{
                    sounds["ui_pop"].play();
                    this.interactive = false;
                    this.cb();
                    this.hide();
            });
        });
    }

    private setPosToBed(): void {
        if (!this.plant) {return}
        const pos = this.plant.gardenBed.position.clone();
        pos.y += 1.3;
        const screenPos = threePosToPixiPoint(this.parent, pos);
        this.position.copyFrom(screenPos);
    }

    private hide(): void {
        new Tween(this.holder.scale).to({x: 0, y:0}, 350).easing(Easing.Back.In)
            .group(Environment.tweenGroup)
            .start(Environment.gameTimeMs)
            .onComplete(()=>{
                this.toBeRemoved = true;
            });
    }

    resize(): void {
        const config: ScaleOverAspect[] = [
            {aspect: 0, interpolate: true, scaleFactor: 2.5},
            {aspect: 1, interpolate: true, scaleFactor: 1.1},
            {aspect: 2, interpolate: true, scaleFactor: 0.8}
        ]
        adjustScaleOverAspect(this, config);
    }
}