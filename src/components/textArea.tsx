import React from "react";

interface TextAreaProps {
  value: string;
  placeholder?: string;
  name: string;
  label?: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}

export default function TextArea({
  value,
  placeholder,
  name,
  label,
  handleChange,
  error,
  required,
}: TextAreaProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-neutral-300">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-4 py-3 rounded-xl bg-neutral-900/90 border text-xs text-white placeholder-neutral-500 focus:outline-none transition-all resize-y ${
          error
            ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            : "border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        }`}
      />
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}