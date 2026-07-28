import sharp from "sharp";

const svg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#1c1917"/>
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="central"
    font-family="Georgia,serif" font-weight="bold"
    font-size="${size * 0.55}" fill="#fafaf9">FA</text>
</svg>`;

for (const size of [192, 512]) {
  const buf = Buffer.from(svg(size));
  await sharp(buf).resize(size, size).png().toFile(`public/icon-${size}.png`);
  console.log(`Generated public/icon-${size}.png`);
}
