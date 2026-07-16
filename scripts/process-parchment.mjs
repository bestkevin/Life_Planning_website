import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicImg = path.join(__dirname, "..", "public", "img");
const candidates = [
    path.join(publicImg, "project2-parchment-src.jpg"),
    path.join(process.env.TEMP || "/tmp", "p2req_docx", "unpacked", "word", "media", "image1.jpeg"),
];
const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
    console.error("No parchment source found");
    process.exit(1);
}

const out = path.join(publicImg, "project2-parchment.png");

const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const rgba = Buffer.from(data);

function distFromWhite(i) {
    const dr = 255 - rgba[i];
    const dg = 255 - rgba[i + 1];
    const db = 255 - rgba[i + 2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

// 1) Soft key against white paper background
const KEY_IN = 28; // fully transparent below
const KEY_OUT = 78; // fully opaque above
for (let i = 0; i < rgba.length; i += channels) {
    const d = distFromWhite(i);
    let a;
    if (d <= KEY_IN) a = 0;
    else if (d >= KEY_OUT) a = 255;
    else a = Math.round(((d - KEY_IN) / (KEY_OUT - KEY_IN)) * 255);
    rgba[i + 3] = a;
}

// 2) Force-clear any remaining near-white connected to the image border
const visited = new Uint8Array(width * height);
const queue = [];
function push(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue.push(idx);
}
for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
}
for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
}
while (queue.length) {
    const idx = queue.pop();
    const i = idx * channels;
    const d = distFromWhite(i);
    if (d > 95 && rgba[i + 3] > 40) continue;
    rgba[i + 3] = 0;
    const x = idx % width;
    const y = (idx / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
}

// 3) Morphological erode of alpha (kills pale halo rim)
function erodeAlpha(srcBuf, radius) {
    const outBuf = Buffer.from(srcBuf);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minA = 255;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (dx * dx + dy * dy > radius * radius) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
                        minA = 0;
                        continue;
                    }
                    minA = Math.min(minA, srcBuf[(ny * width + nx) * channels + 3]);
                }
            }
            outBuf[(y * width + x) * channels + 3] = minA;
        }
    }
    return outBuf;
}

let processed = erodeAlpha(rgba, 2);
processed = erodeAlpha(processed, 1);

// 4) Extra pass: any border-adjacent pale pixel → clear
for (let pass = 0; pass < 4; pass++) {
    const kill = [];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * channels;
            if (processed[i + 3] === 0) continue;
            let touches = false;
            for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]) {
                if (processed[((y + dy) * width + (x + dx)) * channels + 3] === 0) {
                    touches = true;
                    break;
                }
            }
            if (!touches) continue;
            if (distFromWhite(i) < 110) kill.push(i);
        }
    }
    for (const i of kill) processed[i + 3] = 0;
}

// 5) Crop to opaque bounds
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (processed[(y * width + x) * channels + 3] > 16) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
    }
}

const pad = 0;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
const cropped = Buffer.alloc(cropW * cropH * channels);
for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
        const si = ((minY + y) * width + (minX + x)) * channels;
        const di = (y * cropW + x) * channels;
        cropped[di] = processed[si];
        cropped[di + 1] = processed[si + 1];
        cropped[di + 2] = processed[si + 2];
        cropped[di + 3] = processed[si + 3];
    }
}

await sharp(cropped, { raw: { width: cropW, height: cropH, channels } })
    .png()
    .toFile(out);

console.log("wrote", out, `${cropW}x${cropH}`, "from", path.basename(src));
