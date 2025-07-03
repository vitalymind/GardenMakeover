import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import express from "express";

const PATH_ROOT = path.resolve("./");
const PATH_SERVE = path.join(PATH_ROOT, "serve");
const PATH_BUILD = path.join(PATH_ROOT, "build");
const PATH_HTML = path.join(PATH_ROOT, "game.html");

async function build(): Promise<void> {
    const result = await esbuild.build({
        entryPoints: [path.join(PATH_ROOT, 'src/main.ts')],
        bundle: true,
        sourcemap: false,
        minify: false,
        write: false,
        platform: "browser",
        logLevel: "info",
        loader: {
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
    const ctx = await esbuild.context({
        entryPoints: [path.join(PATH_ROOT, 'src/main.ts')],
        bundle: true,
        sourcemap: true,
        minify: false,
        platform: "browser",
        outfile: path.join(PATH_SERVE, 'bundle.js'),
        logLevel: "info",
        loader: {
            '.png': 'dataurl',
            '.glb': 'dataurl',
        },
    });

    const app = express();
    const PORT = 3020;
    app.use(express.static(path.join(PATH_ROOT, 'public')));
    app.use(express.static(PATH_SERVE));
    app.get("/", (req, res)=>{res.sendFile(path.join(PATH_ROOT, 'dev.html'))});
    app.listen(PORT, () => console.log(`Game started at http://localhost:${PORT}`));

    await ctx.watch();
}

async function main(): Promise<void> {
    for (const p of [PATH_BUILD, PATH_SERVE]) {
        if (!fs.existsSync(p)) {fs.mkdirSync(p)}
    }

    for (const arg of process.argv.slice(2)) {
        if (arg === '-build') {
            await build();
            return;
        } else if (arg === "-dev") {
            await startDev();
            return;
        }
    }
}

main();