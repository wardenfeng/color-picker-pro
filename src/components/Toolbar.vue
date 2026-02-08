<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <button @click="store.resetTransform" class="tool-btn" title="重置视图">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        重置视图
      </button>

      <div class="zoom-info">
        {{ Math.round(store.transform.scale * 100) }}%
      </div>
    </div>

    <div class="toolbar-section">
      <button
        @click="store.magnifierEnabled = !store.magnifierEnabled"
        class="tool-btn"
        :class="{ active: store.magnifierEnabled }"
        title="切换放大镜"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        放大镜
      </button>

      <button
        @click="store.togglePicking"
        class="tool-btn"
        :class="{ active: store.isPickingEnabled }"
        title="切换颜色拾取"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.74 5.88-5.74 5.88-5.74-5.88z"/>
          <path d="M5 19h5"/>
          <path d="M5 15h5"/>
          <path d="M5 11h5"/>
          <path d="M19 19h-5"/>
          <path d="M19 15h-5"/>
          <path d="M19 11h-5"/>
        </svg>
        {{ store.isPickingEnabled ? '拾取中' : '拾取颜色' }}
      </button>
    </div>

    <div class="toolbar-section" v-if="store.magnifierEnabled">
      <label class="slider-label">
        <span>放大倍数: {{ store.magnifierScale }}x</span>
        <input
          type="range"
          v-model.number="store.magnifierScale"
          min="2"
          max="16"
          step="1"
          class="slider"
        />
      </label>
    </div>

    <div class="toolbar-section" v-if="store.image">
      <button @click="store.clearImage" class="tool-btn danger" title="清除图片">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '../stores/editorStore';

const store = useEditorStore();
</script>

<style scoped>
.toolbar {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 20px;
  border-right: 1px solid #444;
}

.toolbar-section:last-child {
  border-right: none;
  padding-right: 0;
}

.tool-btn {
  background: #333;
  color: #ccc;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn:hover {
  background: #3a3a3a;
  border-color: #555;
  color: #fff;
}

.tool-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.tool-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #f87171;
}

.zoom-info {
  background: #333;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #888;
  min-width: 60px;
  text-align: center;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ccc;
  font-size: 13px;
}

.slider {
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: #444;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
