import { Container, Sprite } from "pixi.js";
import { Environment } from "./Environment";
import { sprites } from "../loader";
import { GameController } from "./GameController";
import { adjustScaleOverAspect, ScaleOverAspect } from "../helpers";
import { GardenBed } from "./GardenBed";
import { SeedSelectWheel } from "./SeedSelectWheel";
import { PlantAction } from "../config";
import { Plant } from "./Plant";
import { Cta } from "./Cta";
import { PlantActionMenu } from "./PlantActionMenu";

export class Ui {
    stage: Container;
    logo: Sprite;
    cta: Cta;
    seedSelectWheel: SeedSelectWheel;
    activeMenus: PlantActionMenu[] = [];

    constructor(public game: GameController) {
        this.stage = Environment.pixi.stage;

        this.logo = new Sprite(sprites["logo"]);
        this.logo.anchor.set(0);
        this.logo.pivot.set(-20,-20);
        Environment.pixi.stage.addChild(this.logo);

        this.seedSelectWheel = new SeedSelectWheel();
        this.stage.addChild(this.seedSelectWheel.root);

        this.cta = new Cta();
        this.stage.addChild(this.cta);

        Environment.events.on("garden-bed-open-seed-menu", (bed: GardenBed)=>{
            this.seedSelectWheel.open(bed);
        });

        Environment.events.on("plant-open-action-menu", (plant: Plant, action: PlantAction, cb: ()=>void)=>{
            const newMenu = new PlantActionMenu(plant, action, cb);
            this.stage.addChild(newMenu);
            newMenu.show();
            this.activeMenus.push(newMenu);
        });
    }

    update(dt: number): void {
        for (let i=this.activeMenus.length-1; i>=0; i--) {
            if (this.activeMenus[i].toBeRemoved) {
                this.activeMenus.splice(i,1);
            }
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

        //SeedWheel transforms
        this.seedSelectWheel.resize();

        //Planr actions
        for (const menu of this.activeMenus) {menu.resize()}
    }
}