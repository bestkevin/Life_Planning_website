import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(
    __dirname,
    "../assets/pendant-lamp-source.png",
);
const outputPath = path.resolve(__dirname, "../public/img/pendant-lamp.png");

function alphaForPixel(r, g, b) {
    const brightness = (r + g + b) / 3;

    if (brightness >= 246) {
        return 0;
    }

    if (brightness >= 220) {
        return Math.round(255 * ((246 - brightness) / 26));
    }

    return 255;
}

const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
    const alpha = alphaForPixel(data[i], data[i + 1], data[i + 2]);
    data[i + 3] = alpha;
}

const transparent = await sharp(data, {
    raw: {
        width: info.width,
        height: info.height,
        channels: 4,
    },
})
    .png()
    .toBuffer();

const trimmed = await sharp(transparent).trim({ threshold: 12 }).toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();

const cropTop = Math.round(trimmedMeta.height * 0.11);
const cropped = await sharp(trimmed)
    .extract({
        left: 0,
        top: cropTop,
        width: trimmedMeta.width,
        height: Math.max(1, trimmedMeta.height - cropTop),
    })
    .png()
    .toFile(outputPath);

console.log(`Saved ${outputPath} (${cropped.width}x${cropped.height})`);
