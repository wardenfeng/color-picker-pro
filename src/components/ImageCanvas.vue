<template>
  <div class="image-canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @wheel.prevent="handleWheel"
      @mouseenter="handleMouseEnter"
      @contextmenu="handleContextMenu"
      class="main-canvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useEditorStore } from '../stores/editorStore';
import type { TransformState } from '../types';

const store = useEditorStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

// 拖拽状态
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let transformStart: TransformState = { scale: 1, offsetX: 0, offsetY: 0 };

// 渲染图片
function render() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container || !store.image) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 设置画布大小
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制图片（应用变换）
  const { scale, offsetX, offsetY } = store.transform;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(store.image, 0, 0);
  ctx.restore();
}

// 计算合适的初始缩放和位置，使图片居中显示
function fitImageToCanvas() {
  const canvas = canvasRef.value;
  if (!canvas || !store.image) return;

  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  const imgWidth = store.image.width;
  const imgHeight = store.image.height;

  // 计算适应画布的缩放比例
  const scaleX = canvasWidth / imgWidth;
  const scaleY = canvasHeight / imgHeight;
  const fitScale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

  // 计算居中位置
  const scaledWidth = imgWidth * fitScale;
  const scaledHeight = imgHeight * fitScale;
  const offsetX = (canvasWidth - scaledWidth) / 2;
  const offsetY = (canvasHeight - scaledHeight) / 2;

  store.updateTransform({
    scale: fitScale,
    offsetX,
    offsetY,
  });
}

// 处理鼠标按下
function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0) return; // 只响应左键

  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  transformStart = { ...store.transform };
}

// 处理右键点击（保存颜色）
function handleContextMenu(e: MouseEvent) {
  e.preventDefault(); // 阻止默认右键菜单

  // 如果在拾取模式下，保存当前颜色
  if (store.isPickingEnabled && store.previewColor) {
    store.savePickedColor();
  }
}

// 处理鼠标移动
function handleMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  store.updateMousePos(x, y);

  // 拖拽平移
  if (isDragging) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    store.updateTransform({
      offsetX: transformStart.offsetX + dx,
      offsetY: transformStart.offsetY + dy,
    });
  }

  // 拾取颜色（仅在拾取模式开启时）
  if (store.isPickingEnabled && store.isMouseInCanvas && store.image) {
    store.pickColor(canvas, e.clientX, e.clientY);
  }

  render();
}

// 处理鼠标抬起
function handleMouseUp() {
  isDragging = false;
}

// 处理鼠标离开
function handleMouseLeave() {
  isDragging = false;
  store.setMouseInCanvas(false);
  store.currentColor = null;
}

// 处理鼠标进入
function handleMouseEnter() {
  store.setMouseInCanvas(true);
}

// 处理滚轮缩放（以鼠标位置为中心）
function handleWheel(e: WheelEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // 计算缩放因子
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(50, store.transform.scale * delta));

  // 计算新的偏移量，使鼠标位置保持不变
  const newX = mouseX - (mouseX - store.transform.offsetX) * (newScale / store.transform.scale);
  const newY = mouseY - (mouseY - store.transform.offsetY) * (newScale / store.transform.scale);

  store.updateTransform({
    scale: newScale,
    offsetX: newX,
    offsetY: newY,
  });

  render();
}

// 监听窗口大小变化
function handleResize() {
  render();
}

// 监听 store 变化
watch(() => [store.transform, store.image], () => {
  render();
}, { deep: true });

// 监听图片变化，自动适应画布
watch(() => store.image, async () => {
  if (store.image) {
    await nextTick();
    fitImageToCanvas();
  }
});

onMounted(() => {
  window.addEventListener('resize', handleResize);
  render();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 暴露画布引用供放大镜使用
defineExpose({
  canvasRef,
});
</script>

<style scoped>
.image-canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #1a1a1a;
  background-image:
    linear-gradient(45deg, #222 25%, transparent 25%),
    linear-gradient(-45deg, #222 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #222 75%),
    linear-gradient(-45deg, transparent 75%, #222 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.main-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.main-canvas:active {
  cursor: grabbing;
}
</style>
