<template>
  <div class="color-info">
    <div class="color-header">
      <span>颜色信息</span>
      <div class="header-actions" v-if="store.pickedColors.length > 0">
        <button
          @click="copyColorList"
          class="copy-list-btn"
          title="复制颜色列表到剪贴板"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          复制列表
        </button>
        <button
          @click="store.clearPickedColors"
          class="clear-btn"
          title="清空所有拾取的颜色"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 预览卡片（始终显示当前鼠标下的颜色） -->
    <div class="color-card preview-card" v-if="store.isPickingEnabled || store.previewColor">
      <div class="card-header">
        <span class="card-title">{{ store.isPickingEnabled ? '当前预览' : '最后拾取' }}</span>
      </div>
      <div class="card-body">
        <div class="preview-layout">
          <div
            class="color-box"
            :style="{ backgroundColor: previewRgbString }"
          ></div>
          <div class="color-values">
            <div
              class="color-value-item"
              v-for="item in previewColorItems"
              :key="'preview-' + item.format"
              @click="copyPreviewColor(item.format)"
              :class="{ copied: copiedFormat === 'preview-' + item.format }"
              :title="'点击复制' + item.label"
            >
              <span class="color-label">{{ item.label }}</span>
              <span class="color-value">{{ item.value }}</span>
              <span class="copy-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 颜色列表表格 -->
    <div class="color-table-container" v-if="store.pickedColors.length > 0">
      <div class="list-header">已保存 ({{ store.pickedColors.length }})</div>
      <table class="color-table">
        <thead>
          <tr>
            <th class="col-id">#</th>
            <th class="col-preview">预览</th>
            <th class="col-hex">HEX</th>
            <th class="col-rgb">RGB</th>
            <th class="col-hsv">HSV</th>
            <th class="col-hsl">HSL</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="color in store.pickedColors"
            :key="color.id"
            class="color-row"
          >
            <td class="col-id">{{ color.id }}</td>
            <td class="col-preview">
              <div
                class="color-preview-box"
                :style="{ backgroundColor: getColorString(color) }"
                :title="'点击复制所有格式'"
                @click="copySingleColor(color)"
              ></div>
            </td>
            <td class="col-hex">
              <span
                class="color-cell-value"
                @click="copyColorValue(color, 'hex')"
                :class="{ copied: copiedFormat === 'color-' + color.id + '-hex' }"
                title="点击复制 HEX"
              >{{ rgbToHex(color.r, color.g, color.b) }}</span>
            </td>
            <td class="col-rgb">
              <span
                class="color-cell-value"
                @click="copyColorValue(color, 'rgb')"
                :class="{ copied: copiedFormat === 'color-' + color.id + '-rgb' }"
                title="点击复制 RGB"
              >{{ rgbToString(color) }}</span>
            </td>
            <td class="col-hsv">
              <span
                class="color-cell-value"
                @click="copyColorValue(color, 'hsv')"
                :class="{ copied: copiedFormat === 'color-' + color.id + '-hsv' }"
                title="点击复制 HSV"
              >{{ getHsvString(color) }}</span>
            </td>
            <td class="col-hsl">
              <span
                class="color-cell-value"
                @click="copyColorValue(color, 'hsl')"
                :class="{ copied: copiedFormat === 'color-' + color.id + '-hsl' }"
                title="点击复制 HSL"
              >{{ getHslString(color) }}</span>
            </td>
            <td class="col-actions">
              <button
                @click="store.removePickedColor(color.id)"
                class="remove-btn"
                title="删除此颜色"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="no-color" v-else>
      开启拾取模式后，在图片上右键保存颜色
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../stores/editorStore';
import { ColorConverter } from '../utils/colorConverter';
import type { ColorRGB } from '../types';

const store = useEditorStore();
const copiedFormat = ref<string | null>(null);
let copyTimeout: number | null = null;

// 预览颜色
const previewRgbString = computed(() => {
  if (!store.previewColor) return '#000000';
  return `rgb(${store.previewColor.r}, ${store.previewColor.g}, ${store.previewColor.b})`;
});

const previewColorItems = computed(() => {
  if (!store.previewColor) return [];
  const c = store.previewColor;
  return [
    {
      format: 'hex' as const,
      label: 'HEX',
      value: ColorConverter.rgbToHex(c.r, c.g, c.b),
    },
    {
      format: 'rgb' as const,
      label: 'RGB',
      value: ColorConverter.formatRgb(c),
    },
    {
      format: 'hsv' as const,
      label: 'HSV',
      value: ColorConverter.formatHsv(ColorConverter.rgbToHsv(c.r, c.g, c.b)),
    },
    {
      format: 'hsl' as const,
      label: 'HSL',
      value: ColorConverter.formatHsl(ColorConverter.rgbToHsl(c.r, c.g, c.b)),
    },
  ];
});

function rgbToHex(r: number, g: number, b: number): string {
  return ColorConverter.rgbToHex(r, g, b);
}

function rgbToString(c: ColorRGB): string {
  return ColorConverter.formatRgb(c);
}

function getColorString(c: ColorRGB): string {
  return ColorConverter.formatRgb(c);
}

function getHsvString(c: ColorRGB): string {
  const hsv = ColorConverter.rgbToHsv(c.r, c.g, c.b);
  return ColorConverter.formatHsv(hsv);
}

function getHslString(c: ColorRGB): string {
  const hsl = ColorConverter.rgbToHsl(c.r, c.g, c.b);
  return ColorConverter.formatHsl(hsl);
}

// 复制预览颜色的单个格式
async function copyPreviewColor(format: 'hex' | 'rgb' | 'hsv' | 'hsl') {
  if (!store.previewColor) return;
  const success = await copyToClipboard(format, store.previewColor);
  if (success) {
    copiedFormat.value = 'preview-' + format;
    resetCopyTimeout();
  }
}

// 复制历史颜色的单个格式
async function copyColorValue(color: ColorRGB, format: 'hex' | 'rgb' | 'hsv' | 'hsl') {
  const success = await copyToClipboard(format, color);
  if (success) {
    copiedFormat.value = 'color-' + (color as any).id + '-' + format;
    resetCopyTimeout();
  }
}

// 复制单个颜色的所有格式
async function copySingleColor(color: ColorRGB) {
  const text = `HEX: ${rgbToHex(color.r, color.g, color.b)}
RGB: ${rgbToString(color)}
HSV: ${getHsvString(color)}
HSL: ${getHslString(color)}`;
  await navigator.clipboard.writeText(text);
  copiedFormat.value = 'color-' + (color as any).id + '-all';
  resetCopyTimeout();
}

// 复制颜色列表（表格格式）
async function copyColorList() {
  const lines: string[] = [];

  // 表头
  lines.push('#\tHEX\tRGB\tHSV\tHSL');

  // 颜色数据
  for (const color of store.pickedColors) {
    const id = (color as any).id;
    lines.push(`${id}\t${rgbToHex(color.r, color.g, color.b)}\t${rgbToString(color)}\t${getHsvString(color)}\t${getHslString(color)}`);
  }

  await navigator.clipboard.writeText(lines.join('\n'));
  copiedFormat.value = 'list';
  resetCopyTimeout();
}

async function copyToClipboard(format: 'hex' | 'rgb' | 'hsv' | 'hsl', color: ColorRGB): Promise<boolean> {
  let text = '';
  switch (format) {
    case 'hex':
      text = rgbToHex(color.r, color.g, color.b);
      break;
    case 'rgb':
      text = rgbToString(color);
      break;
    case 'hsv':
      text = ColorConverter.formatHsv(ColorConverter.rgbToHsv(color.r, color.g, color.b));
      break;
    case 'hsl':
      text = ColorConverter.formatHsl(ColorConverter.rgbToHsl(color.r, color.g, color.b));
      break;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function resetCopyTimeout() {
  if (copyTimeout) clearTimeout(copyTimeout);
  copyTimeout = window.setTimeout(() => {
    copiedFormat.value = null;
  }, 1500);
}
</script>

<style scoped>
.color-info {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #444;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.copy-list-btn {
  background: #333;
  color: #888;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-list-btn:hover {
  background: #3a3a3a;
  color: #3b82f6;
  border-color: #3b82f6;
}

.clear-btn {
  background: #333;
  color: #888;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #3a3a3a;
  color: #f87171;
  border-color: #ef4444;
}

/* 预览卡片 */
.color-card {
  background: #333;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.color-card.preview-card {
  border: 1px solid #3b82f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.card-title {
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  padding: 12px;
}

.preview-layout {
  display: flex;
  gap: 12px;
}

.color-box {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 2px solid #444;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.color-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.color-value-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #2a2a2a;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.color-value-item:hover {
  background: #3a3a3a;
}

.color-value-item.copied {
  background: #1a3a1a;
}

.color-label {
  color: #888;
  font-size: 10px;
  font-weight: 600;
  width: 28px;
  flex-shrink: 0;
}

.color-value {
  color: #fff;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  flex: 1;
}

.copy-icon {
  color: #666;
  opacity: 0;
  transition: opacity 0.2s;
}

.color-value-item:hover .copy-icon {
  opacity: 1;
}

.color-value-item.copied .copy-icon {
  opacity: 1;
  color: #4ade80;
}

/* 表格容器 */
.color-table-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.list-header {
  color: #888;
  font-size: 12px;
  font-weight: 600;
  padding: 0 4px;
  flex-shrink: 0;
}

.color-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  overflow-y: auto;
  display: block;
  overflow-x: hidden;
}

.color-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.color-table thead::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #333;
  z-index: -1;
}

.color-table th {
  background: #333;
  color: #888;
  font-weight: 600;
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid #444;
  position: relative;
}

.color-table th.col-id {
  width: 30px;
  text-align: center;
}

.color-table th.col-preview {
  width: 40px;
  text-align: center;
}

.color-table th.col-hex,
.color-table th.col-rgb,
.color-table th.col-hsv,
.color-table th.col-hsl {
  min-width: 70px;
}

.color-table th.col-actions {
  width: 40px;
  text-align: center;
}

.color-table tbody {
  display: block;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.color-table tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.color-table tbody tr {
  border-bottom: 1px solid #3a3a3a;
}

.color-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.color-table td {
  padding: 6px 8px;
  color: #ccc;
}

.color-table td.col-id {
  text-align: center;
  color: #666;
  font-size: 10px;
}

.color-table td.col-preview {
  text-align: center;
  padding: 4px;
}

.color-preview-box {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #444;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-preview-box:hover {
  transform: scale(1.1);
  border-color: #3b82f6;
}

.color-cell-value {
  font-family: 'Consolas', 'Monaco', monospace;
  cursor: pointer;
  display: block;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background 0.2s;
}

.color-cell-value:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.color-cell-value.copied {
  background: #1a3a1a;
  color: #4ade80;
}

.col-actions {
  text-align: center;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* 自定义滚动条 */
.color-table::-webkit-scrollbar,
.color-table tbody::-webkit-scrollbar {
  width: 6px;
}

.color-table::-webkit-scrollbar-track,
.color-table tbody::-webkit-scrollbar-track {
  background: #222;
  border-radius: 3px;
}

.color-table::-webkit-scrollbar-thumb,
.color-table tbody::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.color-table::-webkit-scrollbar-thumb:hover,
.color-table tbody::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.no-color {
  color: #666;
  text-align: center;
  padding: 30px 20px;
  font-size: 13px;
}
</style>
