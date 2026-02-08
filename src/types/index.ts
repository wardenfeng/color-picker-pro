// 颜色类型定义
export interface ColorRGB {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a?: number; // 0-1
}

export interface ColorHSV {
  h: number;  // 0-360
  s: number;  // 0-100
  v: number;  // 0-100
  a?: number; // 0-1
}

export interface ColorHSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
  a?: number; // 0-1
}

export type ColorFormat = 'rgb' | 'hex' | 'hsv' | 'hsl';

// 图片变换状态
export interface TransformState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// 鼠标位置
export interface MousePosition {
  x: number;
  y: number;
}
