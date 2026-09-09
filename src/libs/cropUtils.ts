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
 * Accurately projects coordinates so zooming out / fitting full image works seamlessly without clipping
 * @param imageSrc Object URL or base64 of original image
 * @param pixelCrop Cropped coordinates in pixels (can be negative/out-of-bounds when zoomed out)
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
  let targetWidth = Math.round(pixelCrop.width);
  let targetHeight = Math.round(pixelCrop.height);

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Ensure positive canvas dimensions
  targetWidth = Math.max(1, targetWidth);
  targetHeight = Math.max(1, targetHeight);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Clear canvas (keeps transparent background for WebP / PNG)
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // Calculate scale and destination offset on the target canvas
  // This supports zoom-out where pixelCrop.x < 0 or pixelCrop.y < 0
  const scaleX = targetWidth / pixelCrop.width;
  const scaleY = targetHeight / pixelCrop.height;

  const dx = -pixelCrop.x * scaleX;
  const dy = -pixelCrop.y * scaleY;
  const dWidth = image.naturalWidth * scaleX;
  const dHeight = image.naturalHeight * scaleY;

  // Draw full image projected into the canvas area
  ctx.drawImage(image, dx, dy, dWidth, dHeight);

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

