import { brand } from "@/lib/brand";

/** Marca do produto: glifo do medidor + wordmark. */
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#171b22" />
        <path d="M 6 20 A 10 10 0 0 1 26 20" fill="none" stroke="#262b34" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 6 20 A 10 10 0 0 1 23 13" fill="none" stroke="#49d17a" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="16" cy="20" r="2.4" fill="#f2f4f7" />
        <rect x="14.8" y="9" width="2.4" height="11" rx="1.2" fill="#f2f4f7" transform="rotate(34 16 20)" />
      </svg>
      <span className="font-mono text-sm font-semibold tracking-tight text-ink">{brand.name}</span>
    </span>
  );
}
