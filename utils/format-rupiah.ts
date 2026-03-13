export function formatRupiah(value: number | string): string {
  if (value === null || value === undefined) return "$ 0.00";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$ 0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

