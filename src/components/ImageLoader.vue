<template>
  <div class="image-loader">
    <div class="loader-header">图片来源</div>

    <!-- URL 输入 -->
    <div class="url-input-section">
      <input
        type="text"
        v-model="urlInput"
        @keyup.enter="loadFromUrl"
        placeholder="输入图片 URL..."
        class="url-input"
      />
      <button @click="loadFromUrl" :disabled="!urlInput || store.loading" class="btn-primary">
        加载
      </button>
    </div>

    <!-- 拖拽区域 -->
    <div
      class="drop-zone"
      :class="{ dragover: isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>拖拽图片到这里</span>
      <span class="hint">或点击选择文件</span>
      <input
        type="file"
        ref="fileInputRef"
        @change="handleFileSelect"
        accept="image/*"
        class="file-input"
      />
    </div>

    <!-- 剪贴板按钮 -->
    <button @click="loadFromClipboard" class="btn-clipboard" :disabled="store.loading">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
      从剪贴板粘贴 (Ctrl+V)
    </button>

    <!-- 错误提示 -->
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../stores/editorStore';

const store = useEditorStore();
const urlInput = ref('');
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 触发文件选择
function triggerFileInput() {
  fileInputRef.value?.click();
}

// 从 URL 加载
async function loadFromUrl() {
  if (!urlInput.value.trim()) return;
  await store.loadImageFromUrl(urlInput.value.trim());
}

// 处理文件选择
async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await store.loadImageFromFile(file);
  }
  target.value = '';
}

// 处理拖拽悬停
function handleDragOver() {
  isDragOver.value = true;
}

// 处理拖拽离开
function handleDragLeave() {
  isDragOver.value = false;
}

// 处理拖拽放置
async function handleDrop(e: DragEvent) {
  isDragOver.value = false;
  const file = e.dataTransfer?.files[0];
  if (file && file.type.startsWith('image/')) {
    await store.loadImageFromFile(file);
  }
}

// 从剪贴板加载
async function loadFromClipboard() {
  await store.loadImageFromClipboard();
}

// 处理全局粘贴事件
async function handlePaste(e: ClipboardEvent) {
  // 只有当没有焦点在输入框时才响应
  if (e.target instanceof HTMLInputElement) return;

  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      await store.loadImageFromClipboard();
      break;
    }
  }
}

onMounted(() => {
  document.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste);
});
</script>

<style scoped>
.image-loader {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.loader-header {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #444;
}

.url-input-section {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #666;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-zone {
  border: 2px dashed #444;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #888;
}

.drop-zone:hover {
  border-color: #666;
  background: rgba(255, 255, 255, 0.02);
}

.drop-zone.dragover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.drop-zone svg {
  color: #666;
}

.drop-zone .hint {
  font-size: 11px;
  color: #666;
}

.file-input {
  display: none;
}

.btn-clipboard {
  background: #333;
  color: #fff;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-clipboard:hover:not(:disabled) {
  background: #3a3a3a;
  border-color: #555;
}

.btn-clipboard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 10px 12px;
  color: #f87171;
  font-size: 12px;
}
</style>
