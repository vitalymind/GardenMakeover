import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { Environment } from "./Environment";
import { sprites } from "../loader";
import { GameController } from "./GameController";
import { adjustScaleOverAspect, ScaleOverAspect } from "../helpers";
import { GardenBed } from "./GardenBed";
import { SeedSelectWheel } from "./SeedSelectWheel";
import { EndScreen } from "./EndScreen";
import { CAMERA_INTRO_TIME, PlantAction } from "../config";
import { Plant } from "./Plant";
import { Cta } from "./Cta";
import { PlantActionMenu } from "./PlantActionMenu";
import { Tween } from "@tweenjs/tween.js";
import { TutorialHand } from "./TutorialHand";

export class Ui {
    stage: Container;
    private logo: Sprite;
    private cta: Cta;
    private seedSelectWheel: SeedSelectWheel;
    private startSplash: Sprite;
    private activeMenus: PlantActionMenu[] = [];
    private tutorialHand: TutorialHand;
    private tutorialText: Text;
    endScreen: EndScreen;

    constructor(public game: GameController) {
        this.stage = Environment.pixi.stage;

        this.logo = new Sprite(sprites["logo"]);
        this.logo.anchor.set(0);
        this.logo.pivot.set(-20,-20);
        Environment.pixi.stage.addChild(this.logo);

        this.seedSelectWheel = new SeedSelectWheel();
        this.stage.addChild(this.seedSelectWheel.root);

        this.cta = new Cta();
        this.cta.scale.set(1);
        this.cta.pivot.set(40,-60);
        this.stage.addChild(this.cta);

        this.startSplash = new Sprite(Texture.WHITE);
        this.startSplash.anchor.set(0.5);
        this.startSplash.setSize(10000,10000); //Some magic numbers to cover whole screen for sure
        this.stage.addChild(this.startSplash);
        
        this.endScreen = new EndScreen(this);
        this.stage.addChild(this.endScreen);

        this.tutorialText = new Text();
        this.tutorialText.style = new TextStyle({
            dropShadow: true,
            fontWeight: "bold",
            fontSize: 120,
            fill: 0xffffff,
            stroke: {
                width: 5,
                color: 0x000000,
                alpha: 1,
                join: 'round'
            }
        });
        this.tutorialText.alpha = 0;
        this.tutorialText.anchor.set(0.5);
        this.tutorialText.text = "GROW 3 PLANTS";
        this.stage.addChild(this.tutorialText);
        
        this.tutorialHand = new TutorialHand(this);
        this.stage.addChild(this.tutorialHand);

        Environment.events.on("garden-bed-open-seed-menu", (bed: GardenBed)=>{
            this.seedSelectWheel.open(bed);
        });

        Environment.events.on("plant-open-action-menu", (plant: Plant, action: PlantAction, cb: ()=>void)=>{
            const newMenu = new PlantActionMenu(plant, action, cb);
            this.stage.addChild(newMenu);
            newMenu.show();
            newMenu.resize();
            this.activeMenus.push(newMenu);
        });

        Environment.events.on("hide-tutorial", ()=>{
            this.toggleTutorial(false);
        });

        Environment.events.on("camera-intro-done", ()=>{
            this.tutorialHand.show();
            this.toggleTutorial(true);
        });
    }

    unhideScreen(): void {
        new Tween(this.startSplash).to({alpha: 0}, CAMERA_INTRO_TIME*1000 * 0.8).group(Environment.tweenGroup).start(Environment.gameTimeMs)
            .onComplete(()=>{this.startSplash.visible = false;});
    }

    hideUI(): void {
        new Tween(this.logo).to({alpha: 0}, 250).group(Environment.tweenGroup).start(Environment.gameTimeMs);
        new Tween(this.cta).to({alpha: 0}, 250).group(Environment.tweenGroup).start(Environment.gameTimeMs);
    }

    toggleTutorial(on: boolean): void {
        new Tween(this.tutorialText).to({alpha: (on ? 1 : 0)}, 250).group(Environment.tweenGroup).start(Environment.gameTimeMs);
    }

    update(dt: number): void {
        for (let i=this.activeMenus.length-1; i>=0; i--) {
            if (this.activeMenus[i].toBeRemoved) {
                this.activeMenus.splice(i,1);
            }
        }
        if (this.endScreen.visible) {
            this.endScreen.update(dt);
        }
    }

    resize(): void {
        const w = Environment.width;
        const h = Environment.height;

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
        this.cta.position.set(botRight.x, topLeft.y);
        adjustScaleOverAspect(this.cta, config);
        
        //Tutorial
        adjustScaleOverAspect(this.tutorialHand, config);
        adjustScaleOverAspect(this.tutorialText, config);

        //ES
        this.endScreen.resize();

        //SeedWheel transforms
        this.seedSelectWheel.resize();

        //Planr actions
        for (const menu of this.activeMenus) {menu.resize()}
    }
}