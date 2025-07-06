import { Container, Sprite, TextStyle, Text } from "pixi.js";
import { Environment } from "./Environment";
import { sprites } from "../loader";
import { Tween } from "@tweenjs/tween.js";

export class Cta extends Container {
    private sprite: Sprite;
    private shadow: Sprite;
    private text: Text;

    constructor() {
        super()
        this.scale.set(1);
        this.pivot.set(40,-60);
        this.interactive = true;
        this.on("pointerdown",()=>{
            Environment.events.fire("pixi-clicked");
            this.onClick();
        });
        
        this.shadow = new Sprite(sprites['cta_shadow']);
        this.shadow.anchor.set(1,0);
        this.shadow.position.set(5,10)
        this.addChild(this.shadow);

        this.sprite = new Sprite(sprites['cta']);
        this.sprite.anchor.set(1,0);
        this.addChild(this.sprite);

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
        this.text.text = "PLAY NOW!";
        this.text.position.set(-this.sprite.width/2, this.sprite.height/2);
        this.sprite.addChild(this.text);

    }

    private onClick(): void {
        const grp = Environment.tweenGroup;
        new Tween(this.sprite.position).to({x:5, y:10}, 50).group(grp).chain(
            new Tween(this.sprite.position).to({x:0, y:0}, 80).group(grp)
        ).start(Environment.gameTimeMs)
    }
}