import mermaid from 'mermaid';
import { remote } from 'electron';
import { GraphThemeColor, renderTheme } from './theme';

interface IImgConvertOptions {
  format?: 'png' | 'jpg';
  width?: number;
  height?: number;
}

mermaid.mermaidAPI.initialize({
  startOnLoad:false,
  theme: 'default',
  useMaxWidth: true,
} as any);

export function setThemeColor(themeColor: GraphThemeColor) {
  mermaid.mermaidAPI.initialize({
    startOnLoad:false,
    theme: 'default',
    useMaxWidth: true,
    themeCSS: renderTheme({ themeColor }),
  } as any);
}

export async function parseToSvgCode(sourceCode: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      mermaid.mermaidAPI.parse(sourceCode);
      mermaid.mermaidAPI.render(`svg_${Date.now()}`, sourceCode, (svgCode: string) => {
        // purpose: fix svg width attribute, when content overflow, should scroll rather than scale
        if (/<svg[^>]*?>/.test(svgCode)) {
          let width: number;
          const matched = /viewBox="\s?\d+\s+\d+\s+(\d+)\s+\d+\s?"/.exec(svgCode);
          if (matched && matched[1]) {
            width = parseInt(matched[1], 10);
          }
          svgCode = svgCode.replace(/<svg[^>]*?>/, (...args) => {
            let ret = args[0] && args[0].replace('max-width', 'width'); // for sequenece diagram and etc.
            if (width) {
              ret = ret.replace(/width="?100%"?/, `width="${width}"`); // for gantt and pie chart and etc.
            }
            return ret;
          });
        }
        resolve(svgCode);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function parseToImgBuffer(sourceCode: string, options: IImgConvertOptions): Promise<Buffer> {
  options = options || {};

  const svgCode = await parseToSvgCode(sourceCode);

  return new Promise((resolve) => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const blobURL = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = options.width || img.width * 8;
      canvas.height = options.height || img.height * 8;
      if (options.format === 'jpg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL();
      const nativeImg = remote.nativeImage.createFromDataURL(dataURL);
      if (options.format === 'jpg') {
        resolve(nativeImg.toJPEG(100));
      } else {
        resolve(nativeImg.toPNG());
      }
      canvas = null;
    }
    img.src = blobURL;
  });
}

export default { setThemeColor, parseToSvgCode, parseToImgBuffer };
