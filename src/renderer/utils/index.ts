import { remote } from 'electron';

interface ConvertOptions {
  format?: 'png' | 'jpg';
  width?: number;
  height?: number;
}

export async function svg2ImgBuffer(svgCode: string, options?: ConvertOptions): Promise<Buffer> {
  options = options || {};

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
