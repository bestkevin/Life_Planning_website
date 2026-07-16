import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicImg = path.join(__dirname, "..", "public", "img");
const parchmentPath = path.join(publicImg, "project2-parchment.png");
const outPath = path.join(publicImg, "project2-parchment-hex.png");

const CX = 100;
const CY = 100;
const R = 86;
const ORDER = ["I", "A", "S", "E", "C", "R"];
const NAMES = {
    I: "研究型",
    A: "艺术型",
    S: "社会型",
    E: "企业型",
    C: "常规型",
    R: "现实型",
};
const FILL = [
    "rgba(92, 64, 30, 0.42)",
    "rgba(110, 78, 36, 0.4)",
    "rgba(78, 54, 26, 0.42)",
    "rgba(102, 72, 34, 0.4)",
    "rgba(86, 60, 28, 0.42)",
    "rgba(96, 68, 32, 0.4)",
];

function hexVertex(index) {
    const angle = (Math.PI / 180) * (60 * index - 90);
    return {
        x: CX + R * Math.cos(angle),
        y: CY + R * Math.sin(angle),
    };
}

const VERTICES = Array.from({ length: 6 }, (_, i) => hexVertex(i));

function sectorPath(typeIndex) {
    const start = (typeIndex + 5) % 6;
    const end = (start + 1) % 6;
    const a = VERTICES[start];
    const b = VERTICES[end];
    return `M ${CX} ${CY} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
}

function labelPoint(typeIndex) {
    const start = (typeIndex + 5) % 6;
    const end = (start + 1) % 6;
    const a = VERTICES[start];
    const b = VERTICES[end];
    return {
        x: (CX + a.x + b.x) / 3,
        y: (CY + a.y + b.y) / 3,
    };
}

const fontCandidates = [
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/simsun.ttc",
];
const fontFile = fontCandidates.find((p) => fs.existsSync(p));
const fontFace = fontFile
    ? `@font-face { font-family: 'IntroCN'; src: url('file://${fontFile.replace(/\\/g, "/")}'); }`
    : "";

const sectors = ORDER.map((code, index) => {
    const label = labelPoint(index);
    return `
      <path d="${sectorPath(index)}" fill="${FILL[index]}" stroke="rgba(62, 42, 18, 0.72)" stroke-width="1.1"/>
      <text x="${label.x.toFixed(2)}" y="${(label.y - 3).toFixed(2)}" text-anchor="middle"
        font-family="IntroCN, 'Microsoft YaHei', SimHei, sans-serif" font-size="11" font-weight="700"
        fill="#2c1c0c">${NAMES[code]}</text>
      <text x="${label.x.toFixed(2)}" y="${(label.y + 10).toFixed(2)}" text-anchor="middle"
        font-family="IntroCN, 'Microsoft YaHei', SimHei, sans-serif" font-size="10" font-weight="700"
        fill="#3d2810">${code}</text>
    `;
}).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 200 200">
  <defs>
    <style>${fontFace}</style>
    <radialGradient id="glow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="rgba(70, 48, 22, 0.16)"/>
      <stop offset="100%" stop-color="rgba(40, 28, 16, 0.02)"/>
    </radialGradient>
  </defs>
  <polygon points="${VERTICES.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(" ")}"
    fill="url(#glow)" stroke="rgba(54, 36, 16, 0.82)" stroke-width="1.9"/>
  ${sectors}
  <circle cx="${CX}" cy="${CY}" r="18" fill="rgba(42, 28, 14, 0.72)"
    stroke="rgba(54, 36, 16, 0.75)" stroke-width="1.2"/>
  <text x="${CX}" y="${CY + 4}" text-anchor="middle"
    font-family="IntroCN, 'Microsoft YaHei', SimHei, sans-serif" font-size="7.2" font-weight="700"
    fill="#e8d5a8" letter-spacing="0.08em">RIASEC</text>
</svg>`;

const meta = await sharp(parchmentPath).metadata();
const { width, height } = meta;
const hexSize = Math.round(Math.min(width, height) * 0.9);
const left = Math.round((width - hexSize) / 2);
const top = Math.round((height - hexSize) / 2 - height * 0.012);

const hexPng = await sharp(Buffer.from(svg)).resize(hexSize, hexSize).png().toBuffer();

// Soft multiply so parchment texture shows through the inked diagram
await sharp(parchmentPath)
    .composite([{ input: hexPng, left, top, blend: "multiply" }])
    .png()
    .toFile(outPath);

console.log("wrote", outPath, `${width}x${height}`, "hex", hexSize, "font", fontFile || "fallback");
