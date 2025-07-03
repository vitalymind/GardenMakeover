import { Assets, Spritesheet, SpritesheetData, Texture } from "pixi.js";
import { FileLoader, Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*
    Assets
*/
//Spritesheets
import Sheet_common_json from "../src/assets/sheets/common.json";
import Sheet_common_png from "../src/assets/sheets/common.png";
//Models
import Model_object2_glb from "../src/assets/models/objects2.glb";

interface ImportedSpritesheet {
    img: string;
    json: SpritesheetData;
}
interface ImportedGltf {
    name: string;
    dataUrl: string;
}
/*
    Source url data
*/
const importedSpritesheet: ImportedSpritesheet[] = [];
importedSpritesheet.push({img: Sheet_common_png,json: Sheet_common_json});

const importedGltf: ImportedGltf[] = [];
importedGltf.push({name: "object2", dataUrl: Model_object2_glb});

/*
    Exported ready for use items
*/
export const sprites: {[key: string]: Texture} = {}
export const models: {[key: string]: GLTF} = {}

/*
    Loader functions
*/
export const loadSpritesheet = async (data: ImportedSpritesheet): Promise<void> => {
    const texture = await Assets.load(data.img);
    const sheet = new Spritesheet(texture, data.json);
    await sheet.parse();
    for (const [key, texture] of Object.entries(sheet.textures)) {
        const name = key.replace(/\.[^/.]+$/, '');
        sprites[name] = texture;
        console.log(`[Loader]: Sprite ${name} is loaded`);
    }
}

const loadGltf = async (data: ImportedGltf,loader: GLTFLoader): Promise<void> => {
    return new Promise(resolve => {
        loader.load(data.dataUrl, (gltf: GLTF) => {
            models[data.name] = gltf;
            console.log(`[Loader]: GLTF ${data.name} loaded`);
            console.log(gltf);

            gltf.scene.traverse((o: Object3D) => {
                console.log(o)
            });

            resolve();
        });
    });
};

export const loadAssets = async (): Promise<void> => {
    //Load pixijs sprites
    for (const data of importedSpritesheet) {
        await loadSpritesheet(data);
    }

    //Load gltf files
    const gltfLoader = new GLTFLoader();
    for (const data of importedGltf) {
        await loadGltf(data, gltfLoader);
    }

}

