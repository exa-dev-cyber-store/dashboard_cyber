export function formatRupiah(amount: number): string {
    return (amount || 0).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
}

/**
 * Formats a raw number or string into thousand-separated format (e.g. 25000000 -> "25.000.000")
 */
export function formatCurrencyInput(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === "") return "";
    const cleanDigits = String(value).replace(/\D/g, "");
    if (!cleanDigits) return "";
    return new Intl.NumberFormat("id-ID").format(Number(cleanDigits));
}

/**
 * Extracts raw integer number from a formatted currency string (e.g. "25.000.000" -> 25000000)
 */
export function parseCurrencyInput(value: string | number | undefined | null): number {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const cleanDigits = String(value).replace(/\D/g, "");
    return cleanDigits ? parseInt(cleanDigits, 10) : 0;
}

