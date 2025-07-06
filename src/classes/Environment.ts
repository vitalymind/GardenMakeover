import { Group } from "@tweenjs/tween.js";
import { Container, WebGLRenderer as PIXI_WebGLRenderer } from "pixi.js";
import { Scene, WebGLRenderer as THREE_WebGLRenderer } from "three";
import { ThreeCameraController } from "./ThreeCameraController";
import { GameController } from "./GameController";
import { EventArgs, Events } from "../config";

interface Event {
    name: string;
    runs: { [id: string]: number };
    callbacks: { [id: string]: (...args: any[]) => void };
    currentID: number;
}

export class EventManager {
    private _events: { [name: string]: Event } = {};
    public noConsoleLogs = true;

    constructor() {}
    private _register<E extends Events>(event: E,cb: (...arg: EventArgs[E]) => void,times: number): string {
        if (Object.keys(this._events).includes(event)) {
            this._events[event].currentID += 1;
            const key = `id_${this._events[event].currentID}`;
            this._events[event].callbacks[key] = cb;
            this._events[event].runs[key] = times;
        } else {
            this._events[event] = {
                name: event,
                callbacks: { id_0: cb },
                runs: { id_0: times },
                currentID: 0
            };
        }
        return `id_${this._events[event].currentID}`;
    }
    on<E extends Events>(event: E,cb: (...args: EventArgs[E]) => void): string {
        return this._register(event, cb, -1);
    }
    once<E extends Events>(event: E,cb: (...args: EventArgs[E]) => void): string {
        return this._register(event, cb, 1);
    }
    off(event: string, id: string): void;
    off(event: string): void;
    off(event: string, id?: string): void {
        if (Object.keys(this._events).includes(event)) {
            if (id === undefined) {
                delete this._events[event];
            } else {
                delete this._events[event].callbacks[id];
                delete this._events[event].runs[id];
            }
        }
    }
    fire<E extends Events>(event: E, ...args: EventArgs[E]): void {
        if (Object.keys(this._events).includes(event)) {
            const ev = this._events[event];

            if (!this.noConsoleLogs) {
                console.log(`[EVENT]: Fired: ${ev.name}`);
            }
            for (const key of Object.keys(this._events[event].callbacks)) {
                if (this._events[event].runs[key] > 0) {
                    this._events[event].runs[key]--;
                }

                this._events[event].callbacks[key](...args);

                if (this._events[event].runs[key] == 0) {
                    delete this._events[event].callbacks[key];
                    delete this._events[event].runs[key];
                }
            }
        }
    }
}

interface Pixi {
    renderer: PIXI_WebGLRenderer;
    stage: Container;
    gsf: number;
    minWidth: number;
    minHeight: number;
}

interface Three {
    renderer: THREE_WebGLRenderer;
    cameraController: ThreeCameraController;
    stage: Scene;
}

export class Environment {
    static deltaTimeMs: number = 0;
    static averageFPS: number = 0;
    static gameTimeMs: number = 0;

    static width: number;
    static height: number;

    static pixi: Pixi;
    static three: Three;

    static tweenGroup: Group;

    static gc: GameController;
    static events: EventManager;
}
window.env = Environment;