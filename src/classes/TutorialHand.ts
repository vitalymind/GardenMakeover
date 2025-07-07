import { Container, Point, Sprite } from "pixi.js";
import { Ui } from "./Ui";
import { sprites } from "../loader";
import { Environment } from "./Environment";
import { threePosToPixiPoint } from "../helpers";
import { Easing, Tween } from "@tweenjs/tween.js";

export class TutorialHand extends Container {
    private sprite: Sprite;

    private fadeTween: Tween<Sprite>;
    private moveTweenIn: Tween<Point>;
    private moveTweenOut: Tween<Point>;

    constructor(private ui: Ui) {
        super();

        this.sprite = new Sprite(sprites["tutorial_hand"]);
        this.addChild(this.sprite);
        this.sprite.visible = false;
        this.sprite.alpha = 0;
        this.sprite.scale.set(2);

        Environment.events.on("hide-tutorial", ()=>{this.hide()});
    }

    private hide(): void {
        if (this.fadeTween) {
            this.fadeTween.stop();
            this.fadeTween = null;
        }
        this.fadeTween = new Tween(this.sprite).to({alpha: 0}, 150).group(Environment.tweenGroup).start(Environment.gameTimeMs)
            .onComplete(()=>{
                this.visible = false;
                if (this.moveTweenIn) {
                    this.moveTweenIn.stopChainedTweens();
                    this.moveTweenIn.stop();
                    this.moveTweenIn = null;
                }
            });
    }

    show(): void {
        this.setPosToBed();
        Environment.events.on("bed-position-changed", ()=>{this.setPosToBed()});
        this.sprite.visible = true;

        this.moveTweenIn = new Tween(this.sprite.position).to({x:100, y:100}, 450).easing(Easing.Sinusoidal.InOut).group(Environment.tweenGroup);
        this.moveTweenOut = new Tween(this.sprite.position).to({x:0, y:0}, 450).easing(Easing.Sinusoidal.InOut).group(Environment.tweenGroup);
        this.moveTweenIn.chain(this.moveTweenOut);
        this.moveTweenOut.chain(this.moveTweenIn);

        if (this.fadeTween) {
            this.fadeTween.stop();
            this.fadeTween = null;
        }
        this.fadeTween = new Tween(this.sprite).to({alpha: 1}, 150).group(Environment.tweenGroup).start(Environment.gameTimeMs)
            .onComplete(()=>{
                if (this.moveTweenIn) {
                    this.moveTweenIn.start(Environment.gameTimeMs)
                }
            });

    }

    private setPosToBed(): void {
        const midBed = Environment.gc.gardenBeds[1];
        const pos = midBed.position.clone();
        pos.y += 0.4;
        const screenPos = threePosToPixiPoint(this.parent, pos);
        this.position.copyFrom(screenPos);
    }
}