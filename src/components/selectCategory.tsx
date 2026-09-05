import { Category } from "@/types";
import React from "react";

interface SelectCategoryProps {
  name: string;
  label: string;
  options: Category[];
  value?: string;
  handleChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}

export default function SelectCategory({
  name,
  label,
  options,
  value = "Select Category",
  handleChange,
  error,
  required,
}: SelectCategoryProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-neutral-300">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          onChange={handleChange}
          value={value}
          className={`w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border text-xs text-white focus:outline-none transition-all cursor-pointer ${
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          }`}
        >
          <option disabled value="Select Category" className="bg-[#121520] text-neutral-500">
            Select Category
          </option>
          {(options || []).map((option) => (
            <option key={option._id} value={option.name} className="bg-[#121520] text-white">
              {option.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}