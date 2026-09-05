import { IconTrash } from "@tabler/icons-react";

interface ImagePreviewProps {
  image: string;
  onClose?: (index: number) => void;
  index?: number;
  label?: string;
}

export default function ImagePreview({
  image,
  onClose,
  index,
  label,
}: ImagePreviewProps) {
  if (!image) return null;

  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const src = image.startsWith("blob:") || image.startsWith("data:") || image.startsWith("http")
    ? image
    : `${backendUrl}/images${image.startsWith("/") ? "" : "/"}${image}`;

  return (
    <div className="relative group rounded-2xl bg-neutral-900/80 border border-neutral-800 p-2 overflow-hidden shadow-lg flex items-center justify-center w-36 h-36">
      <img
        src={src}
        alt="Product preview"
        className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLElement).style.opacity = "0.3";
        }}
      />

      {label && (
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-semibold text-neutral-300 border border-white/10">
          {label}
        </span>
      )}

      {onClose && typeof index === "number" && (
        <button
          type="button"
          onClick={() => onClose(index)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
          title="Remove Image"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}