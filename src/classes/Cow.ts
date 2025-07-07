import { AnimationAction, AnimationClip, AnimationMixer, LoopRepeat, Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { models, sounds } from "../loader";
import { Environment } from "./Environment";
import { delay } from "../helpers";

export class Cow extends Object3D {
    private model: Object3D;
    private mixer: AnimationMixer;
    private idle: AnimationAction;
    private hidden = false;
    count = 0;

    constructor() {
        super();
        this.model = models["cow"].scene;
        this.model.position.set(4.162, 4.3171, 7.9792);
        this.model.quaternion.set(0,-0.8009,0,-0.5989);
        this.model.scale.set(0.9,0.9,0.9);
        this.add(this.model);

        Environment.three.stage.add(this);

        this.mixer = new AnimationMixer( this.model );
        this.idle = this.mixer.clipAction( AnimationClip.findByName(models["cow"].animations, "idle_cow") );
        this.idle.play();
    }
    
    private async hide(): Promise<void> {
        await delay(1000);
        this.model.rotateY(Math.PI*1.35);
        await delay(300);

        sounds["cow_2"].play();
    }

    click(): void {
        if (this.hidden) {return}
        this.count += 1;

        if (this.count < 24) {
            sounds["cow"].play()
        } else {
            if (this.count >= 24) {
                this.hidden = true;
                this.hide();
            }
        }
    }

    update(dt: number): void {
        this.mixer.update(dt);
    }
}