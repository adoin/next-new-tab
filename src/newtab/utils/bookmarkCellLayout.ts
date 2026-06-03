/** 玻璃卡片区域高度（跨行时按单格高度累加，行间距由网格剩余空间承担） */
export function bookmarkGlassHeight(rowSpan: number, cardSize: number): number {
  const rows = Math.max(1, rowSpan)
  return rows * cardSize
}

/**
 * 跨 N 列时与「N 个 1×1 + 其间间距」同宽。
 * 网格区域宽 N×列宽，列宽≈(100%/N)，间距≈列宽−cardSize → 宽 (N−1)/N×100% + cardSize
 */
export function bookmarkSpannedWidthCss(colSpan: number, cardSize: number): string {
  const span = Math.max(2, colSpan)
  const leadingColsPercent = ((span - 1) / span) * 100
  return `calc(${leadingColsPercent}% + ${cardSize}px)`
}
