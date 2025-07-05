
  export function formatCurrency(value: number): string {
    const formatted = value.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    if (value >= 1_000_000) {
      return `GHS ${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `GHS ${(value / 1_000).toFixed(1)}K`;
    } else {
      return `GHS ${formatted}`;
    }
  }
  