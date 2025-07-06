import { Tween } from "@tweenjs/tween.js";
import { Environment } from "./classes/Environment";

export const r3 = (val: number): number => {
    return Math.round(val * 1000) / 1000;
}

export const colorNumberToString = (input: number): string => {
    return `#${input.toString(16)}`;
};

export const colorStringToNumber = (input: string): number => {
    return Number(input.replace("#", "0x"));
};

export const clamp = (value: number, min: number, max: number): number => {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    }

    return value;
};

export const lerp = (a: number, b: number, t: number): number => {
    return (1 - t) * a + t * b;
};

export const unlerp = (a: number, b: number, v: number): number => {
    return (v - a) / (b - a);
};

export const remapClamped = (
    toStart: number,
    toEnd: number,
    fromStart: number,
    fromEnd: number,
    value: number
): number => {
    return lerp(toStart, toEnd, clamp(unlerp(fromStart, fromEnd, value), 0, 1));
};

export const delay = (durationMs: number): Promise<void> => {
    return new Promise(resolve=>{
        new Tween({a: 0}).to({a:1}, durationMs).group(Environment.tweenGroup).start().onComplete(()=>{resolve()});
    });
}

export const colorStringToRGB = (input: string, norm = false): { r: number; g: number; b: number } => {
    return {
        r: Number("0x" + input.slice(1, 3)) / (norm ? 255 : 1),
        g: Number("0x" + input.slice(3, 5)) / (norm ? 255 : 1),
        b: Number("0x" + input.slice(5, 7)) / (norm ? 255 : 1)
    };
};