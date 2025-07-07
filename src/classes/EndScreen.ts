import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { Ui } from "./Ui";
import { sprites } from "../loader";
import { adjustPositionOverAspect, adjustScaleOverAspect, colorStringToNumber, PositionOverAspect, ScaleOverAspect } from "../helpers";
import { Environment } from "./Environment";
import { EsCta } from "./EsCta";
import { Tween } from "@tweenjs/tween.js";

export class EndScreen extends Container {
    private escta: EsCta;
    private logo: Sprite;
    private splash: Sprite;
    private shakeTime = 0;
    private victoryText: Text;

    constructor(private ui: Ui) {
        super()

        this.splash = new Sprite(Texture.WHITE);
        this.splash.anchor.set(0.5);
        this.splash.setSize(10000,10000); //Some magic numbers to cover whole screen for sure
        this.splash.tint = colorStringToNumber("#000000");
        this.splash.alpha = 0.45;
        this.addChild(this.splash);

        this.victoryText = new Text();
        this.victoryText.style = new TextStyle({
            dropShadow: true,
            fontWeight: "bold",
            fontSize: 85,
            fill: 0xffffff,
            stroke: {
                width: 5,
                color: 0x000000,
                alpha: 1,
                join: 'round'
            }
        });
        this.victoryText.anchor.set(0.5);
        this.victoryText.text = "GREAT WORK!";
        this.addChild(this.victoryText);
        
        this.logo = new Sprite(sprites["logo"]);
        this.logo.anchor.set(0.5);
        this.addChild(this.logo);

        this.escta = new EsCta();
        this.addChild(this.escta);

        this.visible = false;
        this.alpha = 0;
    }

    show(): void {
        this.visible = true;
        new Tween(this).to({alpha: 1}, 300).group(Environment.tweenGroup).start(Environment.gameTimeMs);

        this.escta.shake();
    }

    update(dt: number): void {
        this.shakeTime += dt;

        if (this.shakeTime >= 2) {
            this.shakeTime = 0;
            this.escta.shake();
        }
    }

    resize(): void {
        const w = Environment.width;
        const h = Environment.height;

        //Logo transform
        {
            const config: ScaleOverAspect[] = [
                {aspect: 0, interpolate: true, scaleFactor: 3.5},
                {aspect: 1, interpolate: true, scaleFactor: 1.6},
                {aspect: 2, interpolate: true, scaleFactor: 1.2}
            ]
            adjustScaleOverAspect(this.logo, config);
        }
        {
            const config: PositionOverAspect[] = [
                {aspect: 0, interpolate: true, position: {x:0, y:-1000}},
                {aspect: 1, interpolate: false, position: {x:0, y: -300}},
                {aspect: 1.5, interpolate: true, position: {x: -400, y: 0}}
            ];
            adjustPositionOverAspect(this.logo, config);
        }

        //CTA transform
        {
            const config: ScaleOverAspect[] = [
                {aspect: 0, interpolate: true, scaleFactor: 3.5},
                {aspect: 1, interpolate: true, scaleFactor: 1.6},
                {aspect: 2, interpolate: true, scaleFactor: 1.2}
            ]
            adjustScaleOverAspect(this.escta, config);
        }
        {
            const config: PositionOverAspect[] = [
                {aspect: 0, interpolate: true, position: {x:0, y:800}},
                {aspect: 1, interpolate: false, position: {x:0, y: 500}},
                {aspect: 1.5, interpolate: true, position: {x: 400, y: 80}}
            ];
            adjustPositionOverAspect(this.escta, config);
        }
        
        //Victory text
        {
            const config: ScaleOverAspect[] = [
                {aspect: 0, interpolate: true, scaleFactor: 3.5},
                {aspect: 1, interpolate: true, scaleFactor: 1.6},
                {aspect: 2, interpolate: true, scaleFactor: 1.2}
            ]
            adjustScaleOverAspect(this.victoryText, config);
        }
        {
            const config: PositionOverAspect[] = [
                {aspect: 0, interpolate: true, position: {x:0, y:0}},
                {aspect: 1, interpolate: false, position: {x:0, y: 200}},
                {aspect: 1.5, interpolate: true, position: {x: 400, y: -160}}
            ];
            adjustPositionOverAspect(this.victoryText, config);
        }
    }
}