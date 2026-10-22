const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format integer rupiah (SPEC §9: harga disimpan sebagai bigint). */
export function formatRupiah(amount: number): string {
  return rupiah.format(amount).replace(/\u00A0/g, " ");
}

/** "25 Des 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "10.00" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 1248 -> "1.248" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

/** 288000 ms -> "04:48" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
