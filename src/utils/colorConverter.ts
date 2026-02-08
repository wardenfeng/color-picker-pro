import type { ColorRGB, ColorHSV, ColorHSL } from '../types';

/**
 * 颜色格式转换工具
 */
export class ColorConverter {
  /**
   * RGB 转 HEX
   */
  static rgbToHex(r: number, g: number, b: number, a?: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
    };

    let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (a !== undefined && a < 1) {
      hex += toHex(a * 255);
    }
    return hex;
  }

  /**
   * HEX 转 RGB
   */
  static hexToRgb(hex: string): ColorRGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) {
      throw new Error('Invalid HEX color');
    }

    return {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16),
      a: result[4] ? parseInt(result[4], 16) / 255 : 1,
    };
  }

  /**
   * RGB 转 HSV
   */
  static rgbToHsv(r: number, g: number, b: number, a?: number): ColorHSV {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max * 100;
    let v = max * 100;

    if (delta !== 0) {
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) * 60;
      } else {
        h = ((rNorm - gNorm) / delta + 4) * 60;
      }
    }

    return { h: Math.round(h), s: Math.round(s), v: Math.round(v), a };
  }

  /**
   * HSV 转 RGB
   */
  static hsvToRgb(h: number, s: number, v: number, a?: number): ColorRGB {
    const sNorm = s / 100;
    const vNorm = v / 100;

    const c = vNorm * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = vNorm - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a,
    };
  }

  /**
   * RGB 转 HSL
   */
  static rgbToHsl(r: number, g: number, b: number, a?: number): ColorHSL {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2 * 100;

    if (delta !== 0) {
      s = l > 50 ? delta / (2 - max - min) * 100 : delta / (max + min) * 100;

      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) * 60;
      } else {
        h = ((rNorm - gNorm) / delta + 4) * 60;
      }
    }

    return { h: Math.round(h), s: Math.round(s), l: Math.round(l), a };
  }

  /**
   * HSL 转 RGB
   */
  static hslToRgb(h: number, s: number, l: number, a?: number): ColorRGB {
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a,
    };
  }

  /**
   * 格式化 RGB 字符串
   */
  static formatRgb(rgb: ColorRGB): string {
    return `rgb${rgb.a !== undefined ? 'a' : ''}(${rgb.r}, ${rgb.g}, ${rgb.b}${rgb.a !== undefined ? `, ${rgb.a.toFixed(2)}` : ''})`;
  }

  /**
   * 格式化 HSV 字符串
   */
  static formatHsv(hsv: ColorHSV): string {
    return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
  }

  /**
   * 格式化 HSL 字符串
   */
  static formatHsl(hsl: ColorHSL): string {
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }
}
