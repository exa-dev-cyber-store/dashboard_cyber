export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Crops an image based on pixelCrop and converts/compresses to WebP format
 * @param imageSrc Object URL or base64 of original image
 * @param pixelCrop Cropped coordinates in pixels
 * @param outputFilename Name of original file to keep name base
 * @param maxWidth Target maximum width (default 1000px)
 * @param maxHeight Target maximum height (default 1000px)
 * @param quality WebP compression quality (0.0 to 1.0, default 0.85)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  outputFilename = "product.webp",
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85
): Promise<{ file: File; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas 2d context");
  }

  // Calculate target dimensions respecting max bounds
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw crop
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas blob conversion failed"));
          return;
        }

        const baseName = outputFilename.replace(/\.[^/.]+$/, "") || "image";
        const cleanName = `${baseName}.webp`;
        const file = new File([blob], cleanName, { type: "image/webp" });
        const url = URL.createObjectURL(blob);

        resolve({ file, url });
      },
      "image/webp",
      quality
    );
  });
}
