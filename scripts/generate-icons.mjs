/**
 * 将 public/icons/icon128.png 缩放为 16/32/48（manifest 与 favicon 用）。
 * 请先把 Chrome 商店的 128×128 商店图标复制为 public/icons/icon128.png。
 */
import { mkdir, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public', 'icons')
const source = join(iconsDir, 'icon128.png')
// 128 为源图，勿覆盖同一文件（sharp 会报错）
const sizes = [16, 32, 48]

try {
  await access(source)
} catch {
  console.error(`缺少源图: ${source}`)
  console.error('请把商店用的 128×128 PNG 放到该路径后重试。')
  process.exit(1)
}

await mkdir(iconsDir, { recursive: true })

for (const size of sizes) {
  const out = join(iconsDir, `icon${size}.png`)
  await sharp(source).resize(size, size).png().toFile(out)
  console.log(`wrote ${out}`)
}

console.log(`源图已就绪: ${source}`)
console.log('完成。请执行 pnpm build 并重新打包上传。')
