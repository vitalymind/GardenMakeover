import { Mesh, Object3D, PointLight } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { models, textures } from "../loader";
import { Environment } from "./Environment";
import { Tween } from "@tweenjs/tween.js";
import { colorStringToRGB, randomRange } from "../helpers";
import { createParticleSystem, ParticleSystem } from "@newkrok/three-particles";
import campfire from "../assets/particles/campfire.json";

export class Campfire {
    private model: Object3D;

    private light: PointLight;
    private flickDownTw: Tween<PointLight>;
    private flickUpTw: Tween<PointLight>;

    private emitter: ParticleSystem;

    private timeIn = 150;
    private timeOut = 150;
    private intencityIn = 8;
    private intencityOut = 5;

    private flickTimer = 1;
    private started = false;

    constructor() {
        this.model = clone(models["fireplace"].scene);

        this.model.traverse((o: Object3D)=>{
            if (o instanceof Mesh) {
                o.castShadow = true;
                o.receiveShadow = false;
            }
        });

        this.light = new PointLight("#ff8800", 0.1);
        this.light.position.set(10.7, 5.5, 15.1);
        this.light.castShadow = true;
        Environment.three.stage.add(this.light);

        campfire.startColor.min = colorStringToRGB("#ffd900", true);
        campfire.startColor.max = colorStringToRGB("#ff4603", true);
        //@ts-ignore
        campfire.map = textures["vfx_smoke"];
        //@ts-ignore
        this.emitter = createParticleSystem(campfire);
        this.emitter.instance.position.set(0,0.2,0);
        this.emitter.instance.rotateX(Math.PI*1.5);
        this.emitter.pauseEmitter();
        this.model.add(this.emitter.instance);

        this.model.position.set(10.7, 4, 15.1);
        this.model.scale.set(0.7, 1, 0.7);
        Environment.three.stage.add(this.model);
    }

    start(): void {
        this.started = true;
        new Tween(this.light).to({intensity: 18}, 800).group(Environment.tweenGroup).start(Environment.gameTimeMs);
        this.emitter.resumeEmitter();
    }

    private startFlicking(): void {
        if (this.flickDownTw) {
            this.flickDownTw.stopChainedTweens();
            this.flickDownTw.stop();
        }
        this.flickDownTw = new Tween(this.light).to({intensity: this.intencityOut}, this.timeOut).group(Environment.tweenGroup);
        this.flickUpTw = new Tween(this.light).to({intensity: this.intencityIn}, this.timeIn).group(Environment.tweenGroup);

        this.flickDownTw.chain(this.flickUpTw);
        this.flickUpTw.chain(this.flickDownTw);
        this.flickDownTw.start(Environment.gameTimeMs);
    }

    update(dt: number): void {
        if (!this.started) {return}
        this.flickTimer -= dt;

        if (this.flickTimer <= 0) {
            this.flickTimer = Math.random()*1 + 0.9;
            this.timeIn = randomRange(90,150);
            this.timeOut = randomRange(90,150);
            this.intencityIn = randomRange(18,20);
            this.intencityOut = randomRange(15,16);
            this.startFlicking();
        }

    }
}