import { GameScene } from "./GameScene";

export class GameController {
    gameScene: GameScene;    

    constructor() {
        //Creating scenery
        this.gameScene = new GameScene(this);
    }

    update(dt: number): void {

    }

}