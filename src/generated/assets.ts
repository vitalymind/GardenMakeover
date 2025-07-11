import { ImportedGltf, ImportedSpritesheet, ImportedImages, ImportedSound } from "../loader";
export const importedSpritesheet: ImportedSpritesheet[] = [];
export const importedImages: ImportedImages[] = [];
export const importedTextures: ImportedImages[] = [];
export const importedGltf: ImportedGltf[] = [];
export const importedSounds: ImportedSound[] = [];

import Texture_seed_png from "../assets/textures/seed.png";
importedTextures.push({name: "seed", img: Texture_seed_png});

import Texture_skybox_jpg from "../assets/textures/skybox.jpg";
importedTextures.push({name: "skybox", img: Texture_skybox_jpg});

import Texture_skybox_night_jpg from "../assets/textures/skybox_night.jpg";
importedTextures.push({name: "skybox_night", img: Texture_skybox_night_jpg});

import Texture_vfx_smoke_png from "../assets/textures/vfx_smoke.png";
importedTextures.push({name: "vfx_smoke", img: Texture_vfx_smoke_png});

import Sound_bloop_1 from "../assets/sounds/bloop_1.mp3"; importedSounds.push({name: "bloop_1", dataUrl: Sound_bloop_1});

import Sound_bloop_2 from "../assets/sounds/bloop_2.mp3"; importedSounds.push({name: "bloop_2", dataUrl: Sound_bloop_2});

import Sound_bloop_3 from "../assets/sounds/bloop_3.mp3"; importedSounds.push({name: "bloop_3", dataUrl: Sound_bloop_3});

import Sound_click from "../assets/sounds/click.mp3"; importedSounds.push({name: "click", dataUrl: Sound_click});

import Sound_cow from "../assets/sounds/cow.mp3"; importedSounds.push({name: "cow", dataUrl: Sound_cow});

import Sound_cow_2 from "../assets/sounds/cow_2.mp3"; importedSounds.push({name: "cow_2", dataUrl: Sound_cow_2});

import Sound_dig from "../assets/sounds/dig.mp3"; importedSounds.push({name: "dig", dataUrl: Sound_dig});

import Sound_seeds from "../assets/sounds/seeds.mp3"; importedSounds.push({name: "seeds", dataUrl: Sound_seeds});

import Sound_test from "../assets/sounds/test.mp3"; importedSounds.push({name: "test", dataUrl: Sound_test});

import Sound_theme from "../assets/sounds/theme.mp3"; importedSounds.push({name: "theme", dataUrl: Sound_theme});

import Sound_ui_pop from "../assets/sounds/ui_pop.mp3"; importedSounds.push({name: "ui_pop", dataUrl: Sound_ui_pop});

import Sound_water from "../assets/sounds/water.mp3"; importedSounds.push({name: "water", dataUrl: Sound_water});

import Sheet_common_json from "../assets/sheets/common.json";
import Sheet_common_png from "../assets/sheets/common.png";
importedSpritesheet.push({img: Sheet_common_png,json: Sheet_common_json});

import Model_animal_pen_glb from "../assets/models/animal_pen.glb";
importedGltf.push({name: "animal_pen", dataUrl: Model_animal_pen_glb});

import Model_bag_glb from "../assets/models/bag.glb";
importedGltf.push({name: "bag", dataUrl: Model_bag_glb});

import Model_barn_glb from "../assets/models/barn.glb";
importedGltf.push({name: "barn", dataUrl: Model_barn_glb});

import Model_bucket_glb from "../assets/models/bucket.glb";
importedGltf.push({name: "bucket", dataUrl: Model_bucket_glb});

import Model_corn_1_glb from "../assets/models/corn_1.glb";
importedGltf.push({name: "corn_1", dataUrl: Model_corn_1_glb});

import Model_corn_2_glb from "../assets/models/corn_2.glb";
importedGltf.push({name: "corn_2", dataUrl: Model_corn_2_glb});

import Model_corn_3_glb from "../assets/models/corn_3.glb";
importedGltf.push({name: "corn_3", dataUrl: Model_corn_3_glb});

import Model_cow_glb from "../assets/models/cow.glb";
importedGltf.push({name: "cow", dataUrl: Model_cow_glb});

import Model_fence_glb from "../assets/models/fence.glb";
importedGltf.push({name: "fence", dataUrl: Model_fence_glb});

import Model_fireplace_glb from "../assets/models/fireplace.glb";
importedGltf.push({name: "fireplace", dataUrl: Model_fireplace_glb});

import Model_flower_glb from "../assets/models/flower.glb";
importedGltf.push({name: "flower", dataUrl: Model_flower_glb});

import Model_garden_bed_glb from "../assets/models/garden_bed.glb";
importedGltf.push({name: "garden_bed", dataUrl: Model_garden_bed_glb});

import Model_grape_1_glb from "../assets/models/grape_1.glb";
importedGltf.push({name: "grape_1", dataUrl: Model_grape_1_glb});

import Model_grape_2_glb from "../assets/models/grape_2.glb";
importedGltf.push({name: "grape_2", dataUrl: Model_grape_2_glb});

import Model_grape_3_glb from "../assets/models/grape_3.glb";
importedGltf.push({name: "grape_3", dataUrl: Model_grape_3_glb});

import Model_grass_01_glb from "../assets/models/grass_01.glb";
importedGltf.push({name: "grass_01", dataUrl: Model_grass_01_glb});

import Model_grass_02_glb from "../assets/models/grass_02.glb";
importedGltf.push({name: "grass_02", dataUrl: Model_grass_02_glb});

import Model_hay_glb from "../assets/models/hay.glb";
importedGltf.push({name: "hay", dataUrl: Model_hay_glb});

import Model_hay_single_glb from "../assets/models/hay_single.glb";
importedGltf.push({name: "hay_single", dataUrl: Model_hay_single_glb});

import Model_hill_glb from "../assets/models/hill.glb";
importedGltf.push({name: "hill", dataUrl: Model_hill_glb});

import Model_hoe_glb from "../assets/models/hoe.glb";
importedGltf.push({name: "hoe", dataUrl: Model_hoe_glb});

import Model_pumkin_glb from "../assets/models/pumkin.glb";
importedGltf.push({name: "pumkin", dataUrl: Model_pumkin_glb});

import Model_seed_bag_glb from "../assets/models/seed_bag.glb";
importedGltf.push({name: "seed_bag", dataUrl: Model_seed_bag_glb});

import Model_stone_glb from "../assets/models/stone.glb";
importedGltf.push({name: "stone", dataUrl: Model_stone_glb});

import Model_storage_glb from "../assets/models/storage.glb";
importedGltf.push({name: "storage", dataUrl: Model_storage_glb});

import Model_strawberry_1_glb from "../assets/models/strawberry_1.glb";
importedGltf.push({name: "strawberry_1", dataUrl: Model_strawberry_1_glb});

import Model_strawberry_2_glb from "../assets/models/strawberry_2.glb";
importedGltf.push({name: "strawberry_2", dataUrl: Model_strawberry_2_glb});

import Model_strawberry_3_glb from "../assets/models/strawberry_3.glb";
importedGltf.push({name: "strawberry_3", dataUrl: Model_strawberry_3_glb});

import Model_terrain_glb from "../assets/models/terrain.glb";
importedGltf.push({name: "terrain", dataUrl: Model_terrain_glb});

import Model_tomato_1_glb from "../assets/models/tomato_1.glb";
importedGltf.push({name: "tomato_1", dataUrl: Model_tomato_1_glb});

import Model_tomato_2_glb from "../assets/models/tomato_2.glb";
importedGltf.push({name: "tomato_2", dataUrl: Model_tomato_2_glb});

import Model_tomato_3_glb from "../assets/models/tomato_3.glb";
importedGltf.push({name: "tomato_3", dataUrl: Model_tomato_3_glb});

import Model_tree_green_glb from "../assets/models/tree_green.glb";
importedGltf.push({name: "tree_green", dataUrl: Model_tree_green_glb});

import Model_tree_red_glb from "../assets/models/tree_red.glb";
importedGltf.push({name: "tree_red", dataUrl: Model_tree_red_glb});

