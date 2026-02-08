<template>
  <div
    v-if="store.magnifierEnabled && store.isMouseInCanvas && store.image"
    class="magnifier"
    :style="magnifierStyle"
  >
    <canvas ref="magnifierCanvasRef" :width="store.magnifierSize" :height="store.magnifierSize"></canvas>
    <div class="magnifier-crosshair"></div>
    <div class="magnifier-info">
      <span class="pixel-coords">({{ actualPixelX }}, {{ actualPixelY }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '../stores/editorStore';

const store = useEditorStore();
const magnifierCanvasRef = ref<HTMLCanvasElement | null>(null);

// 计算实际像素坐标
const actualPixelX = computed(() => {
  if (!store.image) return 0;
  const x = Math.floor((store.mousePos.x - store.transform.offsetX) / store.transform.scale);
  return Math.max(0, Math.min(store.image.width - 1, x));
});

const actualPixelY = computed(() => {
  if (!store.image) return 0;
  const y = Math.floor((store.mousePos.y - store.transform.offsetY) / store.transform.scale);
  return Math.max(0, Math.min(store.image.height - 1, y));
});

// 放大镜位置样式
const magnifierStyle = computed(() => ({
  left: `${store.mousePos.x + 20}px`,
  top: `${store.mousePos.y + 20}px`,
  width: `${store.magnifierSize}px`,
  height: `${store.magnifierSize}px`,
}));

// 渲染放大镜内容
function renderMagnifier() {
  const canvas = magnifierCanvasRef.value;
  if (!canvas || !store.image) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = store.magnifierSize;
  const scale = store.magnifierScale;

  // 清空画布
  ctx.clearRect(0, 0, size, size);

  // 创建圆形裁剪区域
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.clip();

  // 填充背景
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();

  // 计算要放大的区域
  const sourceSize = size / scale;
  const sourceX = actualPixelX.value - sourceSize / 2;
  const sourceY = actualPixelY.value - sourceSize / 2;

  // 在临时 canvas 上绘制完整图片
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = store.image.width;
  tempCanvas.height = store.image.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.drawImage(store.image, 0, 0);

    // 绘制放大的区域
    ctx.imageSmoothingEnabled = false; // 像素化效果
    ctx.drawImage(
      tempCanvas,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, size, size
    );
  }

  // 绘制像素网格（当放大倍数足够大时）
  if (scale >= 4) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    const pixelSize = size / sourceSize;

    for (let i = 0; i <= sourceSize; i++) {
      // 垂直线
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, size);
      ctx.stroke();

      // 水平线
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(size, i * pixelSize);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// 监听变化重新渲染
watch([
  () => store.mousePos,
  () => store.transform,
  () => store.magnifierScale,
  () => store.magnifierSize,
  () => store.image,
], renderMagnifier, { deep: true });
</script>

<style scoped>
.magnifier {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.magnifier canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.magnifier-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.magnifier-crosshair::before,
.magnifier-crosshair::after {
  content: '';
  position: absolute;
  background: rgba(255, 0, 0, 0.8);
}

.magnifier-crosshair::before {
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  transform: translateX(-50%);
}

.magnifier-crosshair::after {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: translateY(-50%);
}

.magnifier-info {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  font-family: monospace;
}
</style>
