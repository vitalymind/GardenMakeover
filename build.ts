import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";
import { StaticObject } from "./src/generated/staticObjects"

const PATH_ROOT = path.resolve("./");
const PATH_SERVE = path.join(PATH_ROOT, "serve");
const PATH_BUILD = path.join(PATH_ROOT, "build");
const PATH_HTML = path.join(PATH_ROOT, "game.html");
const PATH_ASSETS = path.join(PATH_ROOT, "src/assets");
const PATH_MODELS = path.join(PATH_ASSETS, "models");
const PATH_IMAGES = path.join(PATH_ASSETS, "images");
const PATH_TEXTURES = path.join(PATH_ASSETS, "textures");
const PATH_SHEETS = path.join(PATH_ASSETS, "sheets");
const PATH_GENERATED = path.join(PATH_ROOT, "src/generated");
const PATH_GENERATED_ASSETS = path.join(PATH_GENERATED, "assets.ts");
const PATH_GENERATED_STATICOBJECTS = path.join(PATH_GENERATED, "staticObjects.ts");

function r4(val: number): number {
    return Math.round(val * 10000) / 10000;
}

function generateStaticObjects(data: StaticObject[]): void {       
    let text =`import { Vector3Tuple, Vector4Tuple } from "three";

export interface StaticObject {
    n: string;
    p: Vector3Tuple;
    r: Vector4Tuple;
    s: Vector3Tuple;
}

export const staticObjects: StaticObject[] = [];\n\n`
        
    for (const o of data) {
        const p = [r4(o.p[0]), r4(o.p[1]), r4(o.p[2])];
        const r = [r4(o.r[0]), r4(o.r[1]), r4(o.r[2]), r4(o.r[3])];
        const s = [r4(o.s[0]), r4(o.s[1]), r4(o.s[2])];
        text += `staticObjects.push({n:'${o.n}', p:[${p}], r:[${r}], s:[${s}]});\n`;
    }

    fs.writeFileSync(PATH_GENERATED_STATICOBJECTS, text, {encoding: "utf-8"});
}

function generateAssetsTs(): void {
    let text = `import { ImportedGltf, ImportedSpritesheet, ImportedImages } from "../loader";\nexport const importedSpritesheet: ImportedSpritesheet[] = [];\nexport const importedImages: ImportedImages[] = [];\nexport const importedTextures: ImportedImages[] = [];\nexport const importedGltf: ImportedGltf[] = [];\n\n`;

    for (const p of fs.readdirSync(PATH_IMAGES)) {
        const fileName = path.parse(p);
        if ([".jpg", ".png", ".webp"].includes(fileName.ext)) {
            text += generateImage(fileName.name, fileName.ext.replace(".",""));
        }
    }

    for (const p of fs.readdirSync(PATH_TEXTURES)) {
        const fileName = path.parse(p);
        if ([".jpg", ".webp"].includes(fileName.ext)) {
            text += generateTextures(fileName.name, fileName.ext.replace(".",""));
        }
    }

    for (const p of fs.readdirSync(PATH_SHEETS)) {
        const fileName = path.parse(p);
        if (fileName.ext == ".json") {
        let ext = "";
            if (fs.existsSync( path.join(PATH_SHEETS, fileName.name+".webp") )) {ext = "webp"}
            else if (fs.existsSync( path.join(PATH_SHEETS, fileName.name+".png") )) {ext = "png"}
            if (ext === "") {
                console.error(`[Loader] Error loading spritesheet ${fileName.name}, relevant image file (.png or .webp) is mising`);
            } else {
                text += generateSpriteSheet(fileName.name, ext);
            }
        }
    }

    for (const p of fs.readdirSync(PATH_MODELS)) {
        const fileName = path.parse(p);
        if (fileName.ext == ".glb") {
            text += generateModel(fileName.name)
        }
    }

    fs.writeFileSync(PATH_GENERATED_ASSETS, text, {flag: "w"});
}

function generateTextures(name: string, ext: string): string {
    return `import Texture_${name}_${ext} from "../assets/textures/${name}.${ext}";\nimportedTextures.push({name: "${name}", img: Texture_${name}_${ext}});\n\n`
}

function generateImage(name: string, ext: string): string {
    return `import Image_${name}_${ext} from "../assets/images/${name}.${ext}";\nimportedImages.push({name: "${name}", img: Image_${name}_${ext}});\n\n`
}

function generateSpriteSheet(name: string, ext: string): string {
    return `import Sheet_${name}_json from "../assets/sheets/${name}.json";\nimport Sheet_${name}_${ext} from "../assets/sheets/${name}.${ext}";\nimportedSpritesheet.push({img: Sheet_${name}_${ext},json: Sheet_${name}_json});\n\n`
}

function generateModel(name: string): string {
    return `import Model_${name}_glb from "../assets/models/${name}.glb";\nimportedGltf.push({name: "${name}", dataUrl: Model_${name}_glb});\n\n`
}

async function build(): Promise<void> {
    generateAssetsTs();
    const result = await esbuild.build({
        entryPoints: [path.join(PATH_ROOT, 'src/main.ts')],
        bundle: true,
        sourcemap: false,
        minify: false,
        write: false,
        platform: "browser",
        logLevel: "info",
        loader: {
            '.jpg': 'dataurl',
            '.webp': 'dataurl',
            '.png': 'dataurl',
            '.glb': 'dataurl',
        },
    });

    const bundle = result.outputFiles?.[0].text;
    const htmlTemplate = fs.readFileSync(PATH_HTML, 'utf-8');
    const finalHtml = htmlTemplate.replace('<!-- SCRIPT_HERE -->', `${bundle}`);
    fs.writeFileSync(path.join(PATH_BUILD, "game.html"), finalHtml);
}

async function startDev(): Promise<void> {
    generateAssetsTs();
    const ctx = await esbuild.context({
        entryPoints: [path.join(PATH_ROOT, 'src/main.ts')],
        bundle: true,
        sourcemap: true,
        minify: false,
        platform: "browser",
        outfile: path.join(PATH_SERVE, 'bundle.js'),
        logLevel: "info",
        loader: {
            '.jpg': 'dataurl',
            '.webp': 'dataurl',
            '.png': 'dataurl',
            '.glb': 'dataurl',
        },
    });

    const app = express();
    const PORT = 3020;
    app.use(express.static(path.join(PATH_ROOT, 'public')));
    app.use(express.static(PATH_SERVE));
    app.use(express.json());

    app.post('/saveStaticObjects', (req: Request, res: Response) => {
        generateStaticObjects(req.body);
        res.sendStatus(200);
    });

    app.get("/", (req, res)=>{res.sendFile(path.join(PATH_ROOT, 'dev.html'))});
    app.listen(PORT, () => console.log(`Game started at http://localhost:${PORT}`));

    await ctx.watch();
}

async function main(): Promise<void> {
    for (const p of [PATH_BUILD, PATH_SERVE, PATH_GENERATED]) {
        if (!fs.existsSync(p)) {fs.mkdirSync(p)}
    }

    for (const f of [PATH_GENERATED_ASSETS]) {
        if (!fs.existsSync(f)) {fs.writeFileSync(f, "")}
    }

    for (const arg of process.argv.slice(2)) {
        if (arg === '-build') {
            await build();
            return;
        } else if (arg === "-dev") {
            await startDev();
            return;
        } else if (arg === "-gen") {
            generateAssetsTs();
            return;
        }
    }
}

main();