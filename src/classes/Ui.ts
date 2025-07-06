import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { Environment } from "./Environment";
import { sprites } from "../loader";
import { GameController } from "./GameController";
import { adjustScaleOverAspect, ScaleOverAspect, threePosToPixiPoint } from "../helpers";
import { Tween } from "@tweenjs/tween.js";
import { GardenBed } from "./GardenBed";
import { SeedSelectWheel } from "./SeedSelectWheel";

class Cta {
    root: Container;
    private sprite: Sprite;
    private shadow: Sprite;
    private text: Text;

    constructor() {
        this.root = new Container();
        this.root.scale.set(1);
        this.root.pivot.set(40,-60);
        this.root.interactive = true;
        this.root.on("pointerdown",()=>{
            Environment.events.fire("pixi-clicked");
            this.onClick();
        });
        
        this.shadow = new Sprite(sprites['cta_shadow']);
        this.shadow.anchor.set(1,0);
        this.shadow.position.set(5,10)
        this.root.addChild(this.shadow);

        this.sprite = new Sprite(sprites['cta']);
        this.sprite.anchor.set(1,0);
        this.root.addChild(this.sprite);

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

export class Ui {
    stage: Container;
    logo: Sprite;
    cta: Cta;
    seedSelectWheel: SeedSelectWheel;

    constructor(public game: GameController) {
        this.stage = Environment.pixi.stage;

        this.logo = new Sprite(sprites["logo"]);
        this.logo.anchor.set(0);
        this.logo.pivot.set(-20,-20);
        Environment.pixi.stage.addChild(this.logo);

        this.seedSelectWheel = new SeedSelectWheel();
        this.stage.addChild(this.seedSelectWheel.root);

        this.cta = new Cta();
        this.stage.addChild(this.cta.root);

        Environment.events.on("garden-bed-open-seed-menu", (bed: GardenBed)=>{
            this.seedSelectWheel.open(bed);
        });
    }



    update(dt: number): void {
    }

    resize(): void {
        const w = Environment.width;
        const h = Environment.height;
        const aspect = w/h;

        const topLeft = this.stage.toLocal({x:0,y:0});
        const botRight = this.stage.toLocal({x:w,y:h});

        //Logo transform
        const config: ScaleOverAspect[] = [
            {aspect: 0, interpolate: true, scaleFactor: 2.5},
            {aspect: 1, interpolate: true, scaleFactor: 0.95},
            {aspect: 2, interpolate: true, scaleFactor: 0.8}
        ]
        this.logo.position.copyFrom(topLeft);
        adjustScaleOverAspect(this.logo, config);

        //CTA transform
        this.cta.root.position.set(botRight.x, topLeft.y);
        adjustScaleOverAspect(this.cta.root, config);

        //SeedWheel transforms
        this.seedSelectWheel.resize();
    }
}