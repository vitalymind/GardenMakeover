import { Container, Sprite, TextStyle, Text, PointData } from "pixi.js";
import { Environment } from "./Environment";
import { sounds, sprites } from "../loader";
import { Tween } from "@tweenjs/tween.js";

//Separate class because it scales from center, unlike ingame CTA
export class EsCta extends Container {
    private shadow: Sprite;
    private animated: Container;
    private sprite: Sprite;
    private text: Text;

    constructor() {
        super()
        this.interactive = true;
        this.on("pointerdown",()=>{
            Environment.events.fire("pixi-clicked");
            this.onClick();
        });
        
        this.shadow = new Sprite(sprites['cta_shadow']);
        this.shadow.anchor.set(0.5);
        this.shadow.position.set(5,10);
        this.shadow.scale.set(1.35,1);
        this.addChild(this.shadow);
        
        this.animated = new Container();
        this.addChild(this.animated);

        this.sprite = new Sprite(sprites['cta']);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(1.35,1);
        this.animated.addChild(this.sprite);

        this.text = new Text();
        this.text.style = new TextStyle({
            dropShadow: true,
            fontWeight: "bold",
            fontSize: 58,
            fill: 0xffffff,
            stroke: {
                width: 4,
                color: 0x000000,
                alpha: 1,
                join: 'round'
            }
        });
        this.text.anchor.set(0.5);
        this.text.text = "HARVEST NOW";
        this.animated.addChild(this.text);
    }

    private onClick(): void {
        sounds["ui_pop"].play();
        const grp = Environment.tweenGroup;
        new Tween(this.animated.position).to({x:5, y:10}, 50).group(grp).chain(
            new Tween(this.animated.position).to({x:0, y:0}, 80).group(grp)
        ).start(Environment.gameTimeMs)
    }

    async shake(): Promise<void> {
        const time = 35;
        const ang = 3;
        for (let i=0; i<4; i++) {
            new Tween(this.animated).to({angle: ang}, time).delay(time*4*i).group(Environment.tweenGroup).start(Environment.gameTimeMs).chain(
                new Tween(this.animated).to({angle: -ang}, time*2).group(Environment.tweenGroup).chain(
                    new Tween(this.animated).to({angle: 0}, time).group(Environment.tweenGroup)
                )
            )
        }
    }
}