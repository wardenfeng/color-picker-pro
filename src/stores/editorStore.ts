import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ColorRGB, TransformState, MousePosition } from '../types';
import { ColorConverter } from '../utils/colorConverter';

export const useEditorStore = defineStore('editor', () => {
  // 图片状态
  const image = ref<HTMLImageElement | null>(null);
  const imageUrl = ref<string>('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 变换状态
  const transform = ref<TransformState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // 鼠标位置
  const mousePos = ref<MousePosition>({ x: 0, y: 0 });
  const isMouseInCanvas = ref(false);

  // 当前拾取的颜色
  const currentColor = ref<ColorRGB | null>(null);

  // 放大镜设置
  const magnifierEnabled = ref(true);
  const magnifierScale = ref(4);
  const magnifierSize = ref(150);

  // 颜色拾取开关
  const isPickingEnabled = ref(false);

  // 计算属性：各种颜色格式
  const hexColor = computed(() => {
    if (!currentColor.value) return '';
    return ColorConverter.rgbToHex(currentColor.value.r, currentColor.value.g, currentColor.value.b);
  });

  const hsvColor = computed(() => {
    if (!currentColor.value) return null;
    return ColorConverter.rgbToHsv(currentColor.value.r, currentColor.value.g, currentColor.value.b);
  });

  const hslColor = computed(() => {
    if (!currentColor.value) return null;
    return ColorConverter.rgbToHsl(currentColor.value.r, currentColor.value.g, currentColor.value.b);
  });

  const rgbColorString = computed(() => {
    if (!currentColor.value) return '';
    return ColorConverter.formatRgb(currentColor.value);
  });

  const hexColorUpper = computed(() => hexColor.value.toUpperCase());
  const hexColorLower = computed(() => hexColor.value.toLowerCase());

  // 动作：设置图片
  function setImage(img: HTMLImageElement, url?: string) {
    image.value = img;
    if (url) imageUrl.value = url;
    error.value = null;
    // 重置变换
    transform.value = { scale: 1, offsetX: 0, offsetY: 0 };
  }

  // 动作：加载图片
  async function loadImageFromUrl(url: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load image');
      const blob = await response.blob();
      const imageElement = new Image();
      imageElement.src = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
      });

      setImage(imageElement, url);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load image';
    } finally {
      loading.value = false;
    }
  }

  // 动作：从文件加载
  async function loadImageFromFile(file: File): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      setImage(img, url);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load image';
    } finally {
      loading.value = false;
    }
  }

  // 动作：从剪贴板加载
  async function loadImageFromClipboard(): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const url = URL.createObjectURL(blob);
          const img = new Image();

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = url;
          });

          setImage(img, url);
          loading.value = false;
          return true;
        }
      }
      error.value = 'No image found in clipboard';
      return false;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to read clipboard';
      loading.value = false;
      return false;
    }
  }

  // 动作：更新变换
  function updateTransform(newTransform: Partial<TransformState>) {
    transform.value = { ...transform.value, ...newTransform };
  }

  // 动作：重置变换
  function resetTransform() {
    transform.value = { scale: 1, offsetX: 0, offsetY: 0 };
  }

  // 动作：拾取颜色
  function pickColor(canvas: HTMLCanvasElement, x: number, y: number) {
    if (!image.value) return;

    // 计算实际图片坐标
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    // 考虑变换后的坐标
    const actualX = Math.floor((canvasX - transform.value.offsetX) / transform.value.scale);
    const actualY = Math.floor((canvasY - transform.value.offsetY) / transform.value.scale);

    // 检查是否在图片范围内
    if (actualX < 0 || actualX >= image.value.width || actualY < 0 || actualY >= image.value.height) {
      currentColor.value = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 在一个临时 canvas 上绘制图片以获取像素数据
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.value.width;
    tempCanvas.height = image.value.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(image.value, 0, 0);
    const imageData = tempCtx.getImageData(actualX, actualY, 1, 1);
    const data = imageData.data;
    const r = data[0] ?? 0;
    const g = data[1] ?? 0;
    const b = data[2] ?? 0;

    currentColor.value = { r, g, b };
  }

  // 动作：复制颜色到剪贴板
  async function copyColorToClipboard(format: 'hex' | 'rgb' | 'hsv' | 'hsl'): Promise<boolean> {
    if (!currentColor.value) return false;

    let text = '';
    switch (format) {
      case 'hex':
        text = hexColor.value;
        break;
      case 'rgb':
        text = rgbColorString.value;
        break;
      case 'hsv':
        text = hsvColor.value ? ColorConverter.formatHsv(hsvColor.value) : '';
        break;
      case 'hsl':
        text = hslColor.value ? ColorConverter.formatHsl(hslColor.value) : '';
        break;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  // 动作：更新鼠标位置
  function updateMousePos(x: number, y: number) {
    mousePos.value = { x, y };
  }

  // 动作：设置鼠标在画布内状态
  function setMouseInCanvas(inCanvas: boolean) {
    isMouseInCanvas.value = inCanvas;
  }

  // 动作：清除图片
  function clearImage() {
    image.value = null;
    imageUrl.value = '';
    currentColor.value = null;
    resetTransform();
  }

  // 动作：切换颜色拾取模式
  function togglePicking() {
    isPickingEnabled.value = !isPickingEnabled.value;
  }

  return {
    // 状态
    image,
    imageUrl,
    loading,
    error,
    transform,
    mousePos,
    isMouseInCanvas,
    currentColor,
    magnifierEnabled,
    magnifierScale,
    magnifierSize,
    isPickingEnabled,

    // 计算属性
    hexColor,
    hexColorUpper,
    hexColorLower,
    hsvColor,
    hslColor,
    rgbColorString,

    // 动作
    setImage,
    loadImageFromUrl,
    loadImageFromFile,
    loadImageFromClipboard,
    updateTransform,
    resetTransform,
    pickColor,
    copyColorToClipboard,
    updateMousePos,
    setMouseInCanvas,
    clearImage,
    togglePicking,
  };
});
