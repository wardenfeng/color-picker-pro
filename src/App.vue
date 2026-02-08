<template>
  <div class="app">
    <header class="app-header">
      <h1>图片预览与编辑器</h1>
    </header>

    <div class="app-main">
      <!-- 左侧边栏：加载器和工具栏 -->
      <aside class="sidebar">
        <ImageLoader />
        <Toolbar />
      </aside>

      <!-- 主画布区域 -->
      <main class="canvas-area">
        <div v-if="!store.image" class="placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>请加载一张图片开始使用</p>
          <p class="hint">支持拖拽、粘贴(Ctrl+V)或URL加载</p>
        </div>
        <div v-else class="canvas-wrapper">
          <ImageCanvas />
          <Magnifier />
        </div>
      </main>

      <!-- 右侧边栏：颜色信息 -->
      <aside class="sidebar-right">
        <ColorInfo />
      </aside>
    </div>

    <!-- 加载指示器 -->
    <div v-if="store.loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEditorStore } from './stores/editorStore';
import ImageCanvas from './components/ImageCanvas.vue';
import ImageLoader from './components/ImageLoader.vue';
import ColorInfo from './components/ColorInfo.vue';
import Magnifier from './components/Magnifier.vue';
import Toolbar from './components/Toolbar.vue';

const store = useEditorStore();

// 组件挂载后设置键盘快捷键
onMounted(() => {
  // Esc 键重置视图
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && store.image) {
      store.resetTransform();
    }
    // +/- 键缩放
    if (e.key === '+' || e.key === '=') {
      const newScale = Math.min(50, store.transform.scale * 1.2);
      store.updateTransform({ scale: newScale });
    }
    if (e.key === '-' || e.key === '_') {
      const newScale = Math.max(0.1, store.transform.scale / 1.2);
      store.updateTransform({ scale: newScale });
    }
  });
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #0f0f0f;
  color: #e0e0e0;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-header {
  background: #1a1a1a;
  padding: 12px 20px;
  border-bottom: 1px solid #333;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background: #1a1a1a;
  border-right: 1px solid #333;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #555;
}

.placeholder svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder p {
  font-size: 14px;
}

.placeholder .hint {
  font-size: 12px;
  margin-top: 8px;
  color: #444;
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sidebar-right {
  width: 280px;
  background: #1a1a1a;
  border-left: 1px solid #333;
  padding: 16px;
  overflow-y: auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay span {
  color: #fff;
  font-size: 14px;
}
</style>
