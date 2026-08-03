const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const [, , sourcePath, outputDir] = process.argv;

if (!sourcePath || !outputDir) {
  console.error("Usage: node slice-storyboard.cjs <2x4-sheet.png> <output-directory>");
  process.exit(1);
}

const FRAME_WIDTH = 960;
const FRAME_HEIGHT = 540;
const COLUMNS = 2;
const ROWS = 4;
const EDGE_INSET = 3;

async function buildFrame(tileBuffer, outputPath) {
  const background = await sharp(tileBuffer)
    .resize(FRAME_WIDTH, FRAME_HEIGHT, { fit: "cover" })
    .blur(18)
    .modulate({ brightness: 0.48, saturation: 0.78 })
    .webp({ quality: 78 })
    .toBuffer();

  const foreground = await sharp(tileBuffer)
    .resize(FRAME_WIDTH, FRAME_HEIGHT, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: foreground }])
    .webp({ quality: 84, effort: 4 })
    .toFile(outputPath);
}

async function main() {
  const source = sharp(sourcePath);
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read dimensions for ${sourcePath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  let frameNumber = 1;
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const x0 = Math.floor((column * metadata.width) / COLUMNS);
      const x1 = Math.floor(((column + 1) * metadata.width) / COLUMNS);
      const y0 = Math.floor((row * metadata.height) / ROWS);
      const y1 = Math.floor(((row + 1) * metadata.height) / ROWS);
      const tile = await sharp(sourcePath)
        .extract({
          left: x0 + EDGE_INSET,
          top: y0 + EDGE_INSET,
          width: x1 - x0 - EDGE_INSET * 2,
          height: y1 - y0 - EDGE_INSET * 2,
        })
        .png()
        .toBuffer();
      const outputName = `frame_${String(frameNumber).padStart(3, "0")}.webp`;
      await buildFrame(tile, path.join(outputDir, outputName));
      frameNumber += 1;
    }
  }

  console.log(`Created ${frameNumber - 1} frames in ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
