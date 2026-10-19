// Switch de ligar/desligar, adaptado ao tema do app (Tailwind v4 + @theme).
// Verde quando ativado. Mostra um spinner no thumb enquanto a ação roda.

import { Loader2 } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  busy?: boolean;
  size?: "small" | "large";
  "aria-label"?: string;
}

export function Toggle({ checked, onChange, disabled = false, busy = false, size = "large", ...rest }: ToggleProps) {
  const dims =
    size === "large"
      ? { track: "h-6 w-11", thumb: "h-5 w-5", on: "translate-x-[22px]", off: "translate-x-0.5" }
      : { track: "h-5 w-9", thumb: "h-4 w-4", on: "translate-x-[18px]", off: "translate-x-0.5" };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-50 ${dims.track} ${
        checked ? "border-good/50 bg-good" : "border-line bg-white/10"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      {...rest}
    >
      <span
        className={`flex transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ${dims.thumb} ${
          checked ? dims.on : dims.off
        }`}
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin text-bg" />}
      </span>
    </button>
  );
}
