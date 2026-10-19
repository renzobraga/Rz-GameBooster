/** Logo da marca: emblema "Rz" (com arco de velocímetro) + "GameBooster". */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5 select-none">
      {/* Emblema Rz — o "objeto" */}
      <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-line bg-gradient-to-br from-panel to-bg">
        <span className="font-display -translate-y-[1px] text-[15px] font-extrabold italic leading-none tracking-tight text-ink">
          Rz
        </span>
        <svg className="absolute bottom-[4px] left-1/2 -translate-x-1/2" width="22" height="9" viewBox="0 0 22 9" aria-hidden="true">
          <path d="M2 8 A 14 14 0 0 0 20 8" fill="none" stroke="#49d17a" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-good/15" />
      </span>

      {/* Wordmark */}
      <span className="font-display text-[18px] font-bold leading-none tracking-tight">
        <span className="text-ink">Game</span>
        <span className="text-good">Booster</span>
      </span>
    </span>
  );
}
