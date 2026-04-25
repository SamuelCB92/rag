import { useId, useState } from "react";
import {
  applyThemeMode,
  getStoredMode,
  setStoredMode,
  type ThemeMode,
} from "../theme";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export default function ThemeSwitch() {
  const id = useId();
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  return (
    <div className="theme-switch">
      <label className="theme-switch__label" htmlFor={id}>
        Aparência
      </label>
      <select
        id={id}
        className="theme-switch__select"
        value={mode}
        onChange={(e) => {
          const next = e.target.value as ThemeMode;
          setMode(next);
          setStoredMode(next);
          applyThemeMode(next);
        }}
        aria-label="Tema claro ou escuro"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
