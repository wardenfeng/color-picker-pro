<template>
  <div class="color-info">
    <div class="color-header">颜色信息</div>

    <div class="color-preview" v-if="store.currentColor">
      <div
        class="color-box"
        :style="{ backgroundColor: store.rgbColorString }"
      ></div>
    </div>

    <div class="color-values" v-if="store.currentColor">
      <div
        class="color-value-item"
        v-for="item in colorItems"
        :key="item.format"
        @click="copyColor(item.format)"
        :class="{ copied: copiedFormat === item.format }"
      >
        <span class="color-label">{{ item.label }}</span>
        <span class="color-value">{{ item.value }}</span>
        <span class="copy-hint">{{ copiedFormat === item.format ? '已复制!' : '点击复制' }}</span>
      </div>
    </div>

    <div class="no-color" v-else>
      将鼠标移到图片上拾取颜色
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../stores/editorStore';
import { ColorConverter } from '../utils/colorConverter';

const store = useEditorStore();
const copiedFormat = ref<string | null>(null);
let copyTimeout: number | null = null;

const colorItems = computed(() => {
  if (!store.currentColor) return [];

  return [
    {
      format: 'hex' as const,
      label: 'HEX',
      value: store.hexColorUpper,
    },
    {
      format: 'rgb' as const,
      label: 'RGB',
      value: store.rgbColorString,
    },
    {
      format: 'hsv' as const,
      label: 'HSV',
      value: store.hsvColor ? ColorConverter.formatHsv(store.hsvColor) : '',
    },
    {
      format: 'hsl' as const,
      label: 'HSL',
      value: store.hslColor ? ColorConverter.formatHsl(store.hslColor) : '',
    },
  ];
});

async function copyColor(format: 'hex' | 'rgb' | 'hsv' | 'hsl') {
  const success = await store.copyColorToClipboard(format);
  if (success) {
    copiedFormat.value = format;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = window.setTimeout(() => {
      copiedFormat.value = null;
    }, 1500);
  }
}
</script>

<style scoped>
.color-info {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.color-header {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #444;
}

.color-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.color-box {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #444;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-value-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.color-value-item:hover {
  background: #3a3a3a;
}

.color-value-item.copied {
  background: #1a3a1a;
}

.color-label {
  color: #888;
  font-size: 12px;
  font-weight: 600;
  width: 40px;
}

.color-value {
  color: #fff;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  flex: 1;
}

.copy-hint {
  color: #666;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.color-value-item:hover .copy-hint {
  opacity: 1;
}

.color-value-item.copied .copy-hint {
  opacity: 1;
  color: #4ade80;
}

.no-color {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 13px;
}
</style>
