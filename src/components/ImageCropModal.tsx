import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { IconZoomIn, IconZoomOut, IconCrop, IconX, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { getCroppedImg, CropArea } from "@/libs/cropUtils";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  title?: string;
  aspectRatio?: number;
  onCropSave: (file: File, previewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  fileName = "product.jpg",
  title = "Crop Product Image",
  aspectRatio = 1 / 1,
  onCropSave,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      setIsProcessing(true);
      // Crop, resize to max 1000x1000, convert to WebP, compress with 0.85 quality
      const { file, url } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        fileName,
        1000,
        1000,
        0.85
      );
      onCropSave(file, url);
    } catch (err) {
      console.error("Error cropping image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <IconCrop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-[11px] text-neutral-400">
                1:1 Square (Apple Store Catalog Standard) • WebP Optimized
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 sm:h-96 bg-neutral-950 select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={0.2}
            maxZoom={3}
            restrictPosition={false}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
            cropShape="rect"
            showGrid={true}
          />
        </div>

        {/* Controls & Footer */}
        <div className="px-6 py-4 space-y-4 bg-neutral-900 border-t border-neutral-800">
          {/* Quick Fit / Mode Presets & Zoom Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(0.8);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700/80 transition-colors"
                title="Fit whole image inside the 1:1 square canvas without cropping"
              >
                Fit Full Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 transition-colors"
                title="Fill 1:1 square (Standard 100%)"
              >
                Fill (100%)
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.2, Number((prev - 0.1).toFixed(2))))}
                className="text-neutral-400 hover:text-white p-1"
                title="Zoom out"
              >
                <IconZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                className="text-neutral-400 hover:text-white p-1"
                title="Zoom in"
              >
                <IconZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-neutral-500 hidden sm:block">
              Drag to position, pinch or slide to zoom
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                {isProcessing ? (
                  <>
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4" />
                    <span>Crop & Convert to WebP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
