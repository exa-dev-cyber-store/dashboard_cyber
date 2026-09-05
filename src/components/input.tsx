import React from "react";
import { formatCurrencyInput, parseCurrencyInput } from "@/libs/formatRupiah";

interface InputProps {
  name: string;
  type: string;
  placeholder?: string;
  label?: string;
  value?: string | number;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  isCurrency?: boolean;
  className?: string;
}

export default function Input({
  name,
  type,
  placeholder,
  label,
  value,
  handleChange,
  error,
  required,
  isCurrency,
  className = "",
}: InputProps) {
  const displayValue = isCurrency ? formatCurrencyInput(value) : value;

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!handleChange) return;

    if (isCurrency) {
      const rawNumber = parseCurrencyInput(e.target.value);
      // Create synthetic change event with parsed number
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: e.target.value === "" ? "" : (rawNumber as any),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(syntheticEvent);
    } else {
      handleChange(e);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-neutral-300">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {isCurrency && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400 select-none">
            Rp
          </span>
        )}
        <input
          id={name}
          type={isCurrency ? "text" : type}
          name={name}
          value={displayValue ?? ""}
          onChange={onInputChange}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl bg-neutral-900/90 border text-xs text-white placeholder-neutral-500 focus:outline-none transition-all ${
            isCurrency ? "pl-10 pr-4" : "px-4"
          } ${
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          } ${className}`}
        />
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}