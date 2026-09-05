import React from "react";
import { IconUpload } from "@tabler/icons-react";

interface InputFileProps {
  name: string;
  label: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  hint?: string;
}

export default function InputFile({
  name,
  label,
  handleChange,
  multiple,
  hint,
}: InputFileProps) {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-300">
        {label}
      </label>
      <div className="relative border border-dashed border-neutral-700/90 hover:border-cyan-500/60 rounded-2xl p-5 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all text-center group cursor-pointer">
        <input
          type="file"
          id={name}
          name={name}
          onChange={handleChange}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <IconUpload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">
              Choose file{multiple ? "s" : ""} or drag & drop here
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {hint || (multiple ? "Upload up to 3 image detail files (PNG, JPG, WebP)" : "PNG, JPG, WebP up to 5MB")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}