import { Assets, Spritesheet, SpritesheetData, Texture as PIXI_Texture } from "pixi.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { importedGltf, importedImages, importedSpritesheet, importedTextures } from "./generated/assets";
import { SRGBColorSpace, TextureLoader, Texture as THREE_Texture } from "three";

export interface ImportedSpritesheet {
    img: string;
    json: SpritesheetData;
}
export interface ImportedImages {
    img: string;
    name: string;
}
export interface ImportedGltf {
    name: string;
    dataUrl: string;
}

/*
    Exported ready for use items
*/
export const sprites: {[key: string]: PIXI_Texture} = {}
export const textures: {[key: string]: THREE_Texture} = {}
export const models: {[key: string]: GLTF} = {}

/*
    Loader functions
*/
const loadImage = async (data: ImportedImages): Promise<void> => {
    const texture = await Assets.load({alias: data.name, src: data.img});
    sprites[data.name] = texture;
    console.log(`[Loader]: Sprite ${data.name} is loaded`);
}

const loadSpritesheet = async (data: ImportedSpritesheet): Promise<void> => {
    const texture = await Assets.load(data.img);
    const sheet = new Spritesheet(texture, data.json);
    await sheet.parse();
    for (const [key, texture] of Object.entries(sheet.textures)) {
        const name = key.replace(/\.[^/.]+$/, '');
        sprites[name] = texture;
        console.log(`[Loader]: Sprite ${name} is loaded`);
    }
}

const loadTexture = async (data: ImportedImages,loader: TextureLoader): Promise<void> => {
    return new Promise(resolve => {
        loader.load(data.img, (texture: THREE_Texture) => {
            texture.colorSpace = SRGBColorSpace;
            textures[data.name] = texture;
            console.log(`[Loader]: Texture ${data.name} is loaded`);
            resolve();
        });
    });
};

const loadGltf = async (data: ImportedGltf,loader: GLTFLoader): Promise<void> => {
    return new Promise(resolve => {
        loader.load(data.dataUrl, (gltf: GLTF) => {
            models[data.name] = gltf;
            console.log(`[Loader]: GLTF ${data.name} loaded`);

            //gltf.scene.traverse((o: Object3D) => {});

            resolve();
        });
    });
};

export const loadAssets = async (): Promise<void> => {
    //Load pixi realated assets
    for (const data of importedSpritesheet) {
        await loadSpritesheet(data);
    }
    for (const data of importedImages) {
        await loadImage(data);
    }

    console.log(sprites);

    //Load three realated assets
    const textureLoader = new TextureLoader();
    const gltfLoader = new GLTFLoader();
    for (const data of importedGltf) {
        await loadGltf(data, gltfLoader);
    }
    for (const data of importedTextures) {
        await loadTexture(data, textureLoader);
    }
}

